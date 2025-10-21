<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import SwipeCard from '$lib/components/SwipeCard.svelte';
	import TutorialOverlay from '$lib/components/TutorialOverlay.svelte';
	import ComparisonView from '$lib/components/ComparisonView.svelte';
	import {
		currentQuiz,
		swipeResults,
		currentItemIndex,
		currentFavorite,
		currentHated,
		showTutorial,
		progress,
		isComplete,
		resetQuiz,
		recordSwipe
	} from '$lib/stores/quiz';
	import { hasCompleted, saveResult, getResult } from '$lib/db/indexedDB';
	import { encodePreferences, encodeSharePayload, decodeSharePayload } from '$lib/utils/encoding';
	import { compareResults } from '$lib/utils/comparison';
	import { generateQuizImage } from '$lib/utils/imageGen';
	import criterionFilms from '$lib/data/criterion-films.json';
	import multiplayerGames from '$lib/data/multiplayer-games.json';
	import foods from '$lib/data/foods.json';

	let quizData = null;
	let shuffledItems = [];
	let alreadyCompleted = false;
	let completedResult = null;
	let stage = 'loading';
	let quizImageUrl = null;
	let friendData = null;
	let comparisonResult = null;
	let errorMessage = '';

	const quizzesMap = {
		'criterion-films': criterionFilms,
		'multiplayer-games': multiplayerGames,
		foods: foods
	};

	onMount(async () => {
		try {
			const quizId = $page.params.id;

			if (!quizzesMap[quizId]) {
				errorMessage = 'Quiz not found';
				stage = 'error';
				return;
			}

			quizData = quizzesMap[quizId];

			// Check if already completed
			const completed = await hasCompleted(quizId);
			if (completed) {
				const stored = await getResult(quizId);
				alreadyCompleted = true;
				completedResult = stored.result;
				stage = 'alreadyCompleted';
				return;
			}

			// Check for share parameter
			const shareParam = $page.url.searchParams.get('r');
			if (shareParam) {
				try {
					friendData = decodeSharePayload(shareParam);
					if (friendData.quizId !== quizId) {
						throw new Error('Quiz mismatch');
					}
				} catch (e) {
					console.error('Failed to decode share data:', e);
					errorMessage = 'This share link is corrupted. Ask your friend to share again.';
					stage = 'error';
					return;
				}
			}

			// Shuffle items for display
			shuffledItems = [...quizData.items].sort(() => Math.random() - 0.5);

			resetQuiz();
			currentQuiz.set(quizData);
			showTutorial.set(true);
			stage = 'preQuiz';
		} catch (error) {
			console.error('Error loading quiz:', error);
			errorMessage = 'Failed to load quiz. Please try again.';
			stage = 'error';
		}
	});

	function handleSwipe(direction) {
		if (stage !== 'swiping') return;

		try {
			const item = shuffledItems[$currentItemIndex];
			const universalIndex = quizData.items.indexOf(item);

			recordSwipe(universalIndex, direction);

			if ($isComplete) {
				completeQuiz();
			}
		} catch (error) {
			console.error('Error during swipe:', error);
			errorMessage = 'An error occurred. Please try again.';
		}
	}

	async function completeQuiz() {
		try {
			stage = 'generating';

			const result = {
				preferences: encodePreferences($swipeResults),
				favoriteIndex: $currentFavorite ?? 0,
				hatedIndex: $currentHated ?? 0,
				completedAt: Date.now()
			};

			// Generate image
			const imageResult = await generateQuizImage(result, quizData);
			quizImageUrl = imageResult.dataUrl;

			// Save to database
			await saveResult(quizData.id, result);

			// If friend data exists, compare
			if (friendData) {
				try {
					const friendPrefs = new Map();
					for (let i = 0; i < 81; i++) {
						const byte = Math.floor((i * 2) / 8);
						const offset = (i * 2) % 8;
						const bits = (friendData.preferences[byte] >> (6 - offset)) & 0b11;
						const directionMap = ['left', 'right', 'down', 'up'];
						friendPrefs.set(i, directionMap[bits]);
					}

					comparisonResult = compareResults(
						{
							preferences: result.preferences,
							favoriteIndex: result.favoriteIndex,
							hatedIndex: result.hatedIndex
						},
						{
							preferences: friendData.preferences,
							favoriteIndex: friendData.favoriteIndex,
							hatedIndex: friendData.hatedIndex
						},
						quizData.items
					);

					// Add preference maps for visualization
					comparisonResult.userAPrefs = new Map($swipeResults);
					comparisonResult.userBPrefs = friendPrefs;

					stage = 'comparison';
				} catch (error) {
					console.error('Comparison error:', error);
					stage = 'complete';
				}
			} else {
				stage = 'complete';
			}
		} catch (error) {
			console.error('Error completing quiz:', error);
			errorMessage = 'Failed to save result. Please try again.';
			stage = 'error';
		}
	}

	function startQuiz() {
		stage = 'swiping';
		showTutorial.set(false);
	}

	async function shareResult() {
		try {
			const result = {
				preferences: encodePreferences($swipeResults),
				favoriteIndex: $currentFavorite ?? 0,
				hatedIndex: $currentHated ?? 0,
				completedAt: Date.now()
			};

			const encoded = encodeSharePayload(result, quizData.id);
			const shareUrl = `${window.location.origin}/quiz/${quizData.id}?r=${encoded}`;

			if (navigator.share) {
				await navigator.share({
					title: `The 81: ${quizData.title}`,
					text: `I just ranked 81 ${quizData.title.toLowerCase()}! Can you match my taste?`,
					url: shareUrl
				});
			} else {
				// Fallback: copy to clipboard
				await navigator.clipboard.writeText(shareUrl);
				alert('Link copied to clipboard!');
			}
		} catch (error) {
			console.error('Share error:', error);
		}
	}

	function goHome() {
		goto('/');
	}

	$: $currentItemIndex;
	$: $currentFavorite;
	$: $currentHated;
</script>

{#if stage === 'loading'}
	<div class="loading-screen">
		<p>Loading quiz...</p>
	</div>
{:else if stage === 'error'}
	<div class="error-screen">
		<div class="error-content">
			<h2>Error</h2>
			<p>{errorMessage}</p>
			<button class="btn btn-primary" on:click={goHome}>Go Home</button>
		</div>
	</div>
{:else if stage === 'alreadyCompleted'}
	<div class="already-completed-screen">
		<div class="modal-content">
			<h2>Already Completed</h2>
			<p>You've already completed this quiz on {new Date(completedResult.completedAt).toLocaleDateString()}</p>
			<p class="info-text">One quiz per person per category to keep things honest!</p>
			<button class="btn btn-primary" on:click={goHome}>Back Home</button>
		</div>
	</div>
{:else if stage === 'preQuiz'}
	<div class="pre-quiz-screen">
		<div class="modal-content">
			<h1>{quizData.title}</h1>
			<p class="description">{quizData.description}</p>

			<div class="warning">
				<p>⚠️ <strong>81 swipes ahead</strong></p>
				<p>If you stop early, you'll have to start over!</p>
			</div>

			<div class="button-group">
				<button class="btn btn-secondary" on:click={goHome}>Cancel</button>
				<button class="btn btn-primary" on:click={startQuiz}>Let's Go!</button>
			</div>
		</div>
	</div>
{:else if stage === 'swiping'}
	<div class="quiz-container">
		<div class="quiz-header">
			<div class="favorite-display">
				<span class="label">FAVORITE:</span>
				<span class="value">
					{$currentFavorite !== null ? quizData.items[$currentFavorite] : 'None yet'}
				</span>
			</div>

			<div class="progress-display">
				{Math.min($currentItemIndex + 1, 81)}/81
			</div>

			<div class="hated-display">
				<span class="label">MOST HATED:</span>
				<span class="value">
					{$currentHated !== null ? quizData.items[$currentHated] : 'None yet'}
				</span>
			</div>
		</div>

		<div class="progress-bar">
			<div class="progress-fill" style="width: {$progress * 100}%" />
		</div>

		<div class="card-container">
			{#if $currentItemIndex < shuffledItems.length}
				<SwipeCard
					item={shuffledItems[$currentItemIndex]}
					index={$currentItemIndex}
					onSwipe={handleSwipe}
					favoriteItem={$currentFavorite}
					hatedItem={$currentHated}
				/>
			{/if}
		</div>

		{#if $showTutorial}
			<TutorialOverlay onDismiss={() => showTutorial.set(false)} />
		{/if}
	</div>
{:else if stage === 'complete' || stage === 'comparison'}
	<div class="results-screen">
		<div class="results-container">
			<h2>Quiz Complete!</h2>

			{#if quizImageUrl && stage === 'complete'}
				<div class="image-section">
					<img src={quizImageUrl} alt="Your result pattern" />
				</div>
			{/if}

			{#if stage === 'comparison' && comparisonResult}
				<ComparisonView comparison={comparisonResult} quizData={quizData} />
			{/if}

			<div class="button-group">
				<button class="btn btn-secondary" on:click={goHome}>Home</button>
				<button class="btn btn-primary" on:click={shareResult}>Share Result</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.loading-screen,
	.error-screen,
	.already-completed-screen,
	.pre-quiz-screen {
		background: #000000;
		color: #FFFFFF;
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.modal-content,
	.error-content {
		background: #000000;
		border: 2px solid #FFFFFF;
		padding: 3rem;
		border-radius: 12px;
		max-width: 500px;
		text-align: center;
	}

	h2 {
		font-size: 2rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
	}

	h1 {
		font-size: 2.5rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
	}

	.description {
		font-size: 1rem;
		color: #CCCCCC;
		margin: 1rem 0;
		line-height: 1.6;
	}

	.warning {
		background: rgba(255, 0, 0, 0.1);
		border: 1px solid #FF0000;
		padding: 1.5rem;
		border-radius: 8px;
		margin: 2rem 0;
		text-align: left;
	}

	.warning p {
		margin: 0.5rem 0;
		font-size: 0.95rem;
	}

	.warning p:first-child {
		margin-top: 0;
	}

	.warning p:last-child {
		margin-bottom: 0;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
		justify-content: center;
	}

	.btn {
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 700;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.btn-primary {
		background: #FFFFFF;
		color: #000000;
	}

	.btn-primary:hover {
		background: #CCCCCC;
	}

	.btn-primary:active {
		background: #999999;
	}

	.btn-secondary {
		background: transparent;
		color: #FFFFFF;
		border: 2px solid #FFFFFF;
	}

	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.btn-secondary:active {
		background: rgba(255, 255, 255, 0.2);
	}

	.quiz-container {
		background: #000000;
		color: #FFFFFF;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.quiz-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		gap: 1rem;
		border-bottom: 1px solid #333333;
		flex-wrap: wrap;
	}

	.favorite-display,
	.hated-display {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 150px;
		flex: 1;
	}

	.label {
		font-size: 0.625rem;
		font-weight: 700;
		letter-spacing: 1px;
		color: #999999;
		text-transform: uppercase;
	}

	.value {
		font-size: 0.875rem;
		color: #FFFFFF;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.progress-display {
		font-size: 0.875rem;
		font-weight: 700;
		text-align: center;
		min-width: 60px;
		color: #CCCCCC;
	}

	.progress-bar {
		height: 2px;
		background: #333333;
		width: 100%;
	}

	.progress-fill {
		height: 100%;
		background: #00FF00;
		transition: width 0.3s ease;
	}

	.card-container {
		position: relative;
		flex: 1;
		overflow: hidden;
	}

	.results-screen {
		background: #000000;
		color: #FFFFFF;
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.results-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
		max-width: 800px;
	}

	.image-section {
		width: 100%;
		max-width: 400px;
		border: 2px solid #FFFFFF;
		border-radius: 12px;
		overflow: hidden;
	}

	.image-section img {
		width: 100%;
		height: auto;
		display: block;
	}

	.info-text {
		font-size: 0.875rem;
		color: #CCCCCC;
		font-style: italic;
	}

	@media (max-width: 768px) {
		.quiz-header {
			padding: 1rem;
		}

		.favorite-display,
		.hated-display {
			min-width: 120px;
			font-size: 0.75rem;
		}

		.value {
			font-size: 0.75rem;
		}

		h1,
		h2 {
			font-size: 1.5rem;
		}

		.button-group {
			flex-direction: column;
			width: 100%;
		}

		.btn {
			width: 100%;
		}
	}
</style>
