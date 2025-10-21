<script>
	import criterionFilms from '$lib/data/criterion-films.json';
	import multiplayerGames from '$lib/data/multiplayer-games.json';
	import foods from '$lib/data/foods.json';
	import { goto } from '$app/navigation';

	const quizzes = [criterionFilms, multiplayerGames, foods];

	function selectQuiz(quizId) {
		goto(`/quiz/${quizId}`);
	}
</script>

<div class="home-container">
	<div class="header">
		<h1>THE 81</h1>
		<p class="tagline">Rate 81 items. Share your taste. Compare with friends.</p>
	</div>

	<div class="quizzes-grid">
		{#each quizzes as quiz}
			<button class="quiz-card" on:click={() => selectQuiz(quiz.id)}>
				<div class="card-content">
					<h2>{quiz.title}</h2>
					<p class="description">{quiz.description}</p>
					<p class="item-count">{quiz.items.length} items</p>
				</div>
			</button>
		{/each}
	</div>

	<div class="info-section">
		<h3>How it works</h3>
		<ol>
			<li>Swipe through 81 items in a category</li>
			<li>Your preferences are encoded in a visual pattern</li>
			<li>Share with friends to compare taste</li>
			<li>See compatibility scores & disagreements</li>
		</ol>
	</div>
</div>

<style>
	.home-container {
		background: #000000;
		color: #FFFFFF;
		min-height: 100vh;
		padding: 2rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.header {
		text-align: center;
		margin-bottom: 3rem;
	}

	h1 {
		font-size: 4rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: 3px;
		text-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
	}

	.tagline {
		font-size: 1.25rem;
		margin: 1rem 0 0 0;
		color: #CCCCCC;
		font-style: italic;
	}

	.quizzes-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 2rem;
		width: 100%;
		max-width: 1000px;
		margin-bottom: 4rem;
	}

	.quiz-card {
		background: #000000;
		border: 2px solid #FFFFFF;
		padding: 2rem;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: left;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		min-height: 200px;
	}

	.quiz-card:hover {
		border-color: #00FF00;
		background: rgba(0, 255, 0, 0.05);
		transform: translateY(-4px);
	}

	.quiz-card:active {
		border-color: #CCCCCC;
		background: rgba(255, 255, 255, 0.1);
	}

	.card-content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.quiz-card h2 {
		font-size: 1.75rem;
		margin: 0;
		font-weight: 700;
	}

	.description {
		font-size: 0.875rem;
		margin: 0;
		color: #CCCCCC;
		line-height: 1.5;
	}

	.item-count {
		font-size: 0.75rem;
		margin: 0;
		color: #999999;
		font-weight: 700;
		letter-spacing: 1px;
		align-self: flex-end;
	}

	.info-section {
		background: rgba(255, 255, 255, 0.05);
		border: 1px solid #333333;
		padding: 2rem;
		border-radius: 12px;
		max-width: 500px;
		margin-top: 2rem;
	}

	.info-section h3 {
		font-size: 1.25rem;
		margin: 0 0 1rem 0;
		font-weight: 700;
	}

	.info-section ol {
		list-style-position: inside;
		padding: 0;
		margin: 0;
	}

	.info-section li {
		font-size: 0.875rem;
		margin: 0.5rem 0;
		color: #CCCCCC;
	}

	@media (max-width: 768px) {
		h1 {
			font-size: 2.5rem;
		}

		.tagline {
			font-size: 1rem;
		}

		.quizzes-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
