<script>
	export let comparison = null;
	export let quizData = null;

	let expanded = false;
</script>

{#if comparison && quizData}
	<div class="comparison-container">
		<div class="score-section">
			<div class="score-display">
				<span class="score-number">{comparison.score}%</span>
				<p class="flavor-text">{comparison.flavorText}</p>
			</div>
		</div>

		<div class="matches-section">
			<h3>MATCHES: {comparison.matches}/81</h3>

			{#if comparison.perfectMatches.length > 0}
				<div class="category">
					<p class="category-title">YOU BOTH LOVED:</p>
					<ul class="items-list">
						{#each comparison.perfectMatches.filter((m) => m.type === 'loved').slice(0, 5) as item}
							<li>• {item.item}</li>
						{/each}
						{#if comparison.perfectMatches.filter((m) => m.type === 'loved').length > 5}
							<li class="more">
								+{comparison.perfectMatches.filter((m) => m.type === 'loved').length - 5} more
							</li>
						{/if}
					</ul>
				</div>

				{#if comparison.perfectMatches.filter((m) => m.type === 'hated').length > 0}
					<div class="category">
						<p class="category-title">YOU BOTH HATED:</p>
						<ul class="items-list">
							{#each comparison.perfectMatches.filter((m) => m.type === 'hated').slice(0, 5) as item}
								<li>• {item.item}</li>
							{/each}
							{#if comparison.perfectMatches.filter((m) => m.type === 'hated').length > 5}
								<li class="more">
									+{comparison.perfectMatches.filter((m) => m.type === 'hated').length - 5} more
								</li>
							{/if}
						</ul>
					</div>
				{/if}
			{/if}

			{#if comparison.bigDisagrees.length > 0}
				<div class="category">
					<p class="category-title warning">BIG DISAGREES:</p>
					<ul class="items-list">
						{#each comparison.bigDisagrees.slice(0, 5) as item}
							<li>
								• {item.item}
								<span class="disagree-text">
									{#if item.userAFeels === 'loved'}
										You loved, they hated
									{:else}
										You hated, they loved
									{/if}
								</span>
							</li>
						{/each}
						{#if comparison.bigDisagrees.length > 5}
							<li class="more">+{comparison.bigDisagrees.length - 5} more disagreements</li>
						{/if}
					</ul>
				</div>
			{/if}
		</div>

		<button class="expand-btn" on:click={() => (expanded = !expanded)}>
			{expanded ? 'Hide' : 'See'} Full Breakdown
		</button>

		{#if expanded}
			<div class="full-breakdown">
				<h4>All 81 Items</h4>
				<div class="breakdown-grid">
					{#each quizData.items as item, i}
						{@const prefA = comparison.userAPrefs.get(i)}
						{@const prefB = comparison.userBPrefs.get(i)}
						{@const match = prefA === prefB}
						<div
							class="breakdown-item"
							class:match
							class:love={match && prefA === 'up'}
							class:hate={match && prefA === 'down'}
							class:disagree={!match && ((prefA === 'up' && prefB === 'down') || (prefA === 'down' && prefB === 'up'))}
							class:mixed={!match && !((prefA === 'up' && prefB === 'down') || (prefA === 'down' && prefB === 'up'))}
							title={item}
						/>
					{/each}
				</div>
				<div class="legend">
					<div class="legend-item love">Both Loved</div>
					<div class="legend-item hate">Both Hated</div>
					<div class="legend-item disagree">Big Disagree</div>
					<div class="legend-item mixed">Mixed</div>
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.comparison-container {
		background: #000000;
		color: #FFFFFF;
		padding: 2rem;
		border: 2px solid #FFFFFF;
		border-radius: 12px;
		max-width: 600px;
		margin: 0 auto;
	}

	.score-section {
		text-align: center;
		margin-bottom: 2rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #FFFFFF;
	}

	.score-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
	}

	.score-number {
		font-size: 4rem;
		font-weight: 700;
		color: #FFFFFF;
	}

	.flavor-text {
		font-size: 1.25rem;
		margin: 0;
		font-style: italic;
		color: #CCCCCC;
	}

	.matches-section {
		margin-bottom: 2rem;
	}

	h3 {
		font-size: 1rem;
		font-weight: 700;
		margin: 0 0 1rem 0;
		letter-spacing: 1px;
	}

	.category {
		margin-bottom: 1.5rem;
	}

	.category-title {
		font-size: 0.875rem;
		font-weight: 700;
		margin: 0 0 0.5rem 0;
		letter-spacing: 1px;
		color: #FFFFFF;
	}

	.category-title.warning {
		color: #FF0000;
	}

	.items-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.items-list li {
		font-size: 0.875rem;
		margin: 0.5rem 0;
		color: #CCCCCC;
		word-break: break-word;
	}

	.disagree-text {
		display: block;
		font-size: 0.75rem;
		color: #FF0000;
		font-weight: 700;
		margin-top: 0.25rem;
	}

	.more {
		color: #999999;
		font-style: italic;
	}

	.expand-btn {
		background: #FFFFFF;
		color: #000000;
		border: none;
		padding: 0.75rem 1.5rem;
		font-size: 0.875rem;
		font-weight: 700;
		border-radius: 6px;
		cursor: pointer;
		width: 100%;
		transition: background 0.2s ease;
		margin-bottom: 1rem;
	}

	.expand-btn:hover {
		background: #CCCCCC;
	}

	.full-breakdown {
		background: rgba(255, 255, 255, 0.05);
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid #333333;
	}

	h4 {
		font-size: 0.875rem;
		margin: 0 0 1rem 0;
	}

	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		gap: 4px;
		margin-bottom: 1rem;
	}

	.breakdown-item {
		aspect-ratio: 1;
		border-radius: 4px;
		background: #333333;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid #444444;
	}

	.breakdown-item:hover {
		transform: scale(1.1);
		z-index: 10;
	}

	.breakdown-item.match {
		background: #CCCCCC;
	}

	.breakdown-item.love {
		background: #00FF00;
	}

	.breakdown-item.hate {
		background: #FF0000;
	}

	.breakdown-item.disagree {
		background: #FFFF00;
	}

	.breakdown-item.mixed {
		background: #999999;
	}

	.legend {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.75rem;
		font-size: 0.75rem;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.legend-item::before {
		content: '';
		display: inline-block;
		width: 16px;
		height: 16px;
		border-radius: 3px;
	}

	.legend-item.love::before {
		background: #00FF00;
	}

	.legend-item.hate::before {
		background: #FF0000;
	}

	.legend-item.disagree::before {
		background: #FFFF00;
	}

	.legend-item.mixed::before {
		background: #999999;
	}
</style>
