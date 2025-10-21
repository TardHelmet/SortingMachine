<script>
	let { onDismiss = () => {} } = $props();
</script>

<div class="tutorial-overlay">
	<div class="tutorial-content">
		<h2>How to Swipe</h2>
		
		<div class="tutorial-grid">
			<div class="tutorial-item left">
				<div class="arrow">👈</div>
				<p class="label">LEFT</p>
				<p class="desc">Meh</p>
			</div>
			
			<div class="tutorial-item right">
				<div class="arrow">👉</div>
				<p class="label">RIGHT</p>
				<p class="desc">Good</p>
			</div>
			
			<div class="tutorial-item up">
				<div class="arrow">👆</div>
				<p class="label">UP</p>
				<p class="desc">THE BEST</p>
			</div>
			
			<div class="tutorial-item down">
				<div class="arrow">👇</div>
				<p class="label">DOWN</p>
				<p class="desc">THE WORST</p>
			</div>
		</div>
		
		<button class="dismiss-btn" on:click={onDismiss}>
			Got it!
		</button>
	</div>
</div>

<style>
	.tutorial-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.95);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.tutorial-content {
		background: #000000;
		border: 2px solid #FFFFFF;
		border-radius: 12px;
		padding: 2rem;
		max-width: 500px;
		text-align: center;
	}

	h2 {
		color: #FFFFFF;
		font-size: 2rem;
		margin: 0 0 2rem 0;
		font-weight: 700;
	}

	.tutorial-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.tutorial-item {
		padding: 1.5rem;
		border-radius: 8px;
		border: 2px solid #FFFFFF;
	}

	.tutorial-item.left {
		background: rgba(255, 0, 0, 0.2);
		border-color: #FF0000;
	}

	.tutorial-item.right {
		background: rgba(0, 255, 0, 0.2);
		border-color: #00FF00;
	}

	.tutorial-item.up {
		background: rgba(255, 255, 255, 0.2);
		border-color: #FFFFFF;
	}

	.tutorial-item.down {
		background: rgba(100, 100, 100, 0.3);
		border-color: #666666;
	}

	.arrow {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
	}

	.label {
		color: #FFFFFF;
		font-size: 0.875rem;
		font-weight: 700;
		margin: 0.5rem 0 0 0;
		letter-spacing: 1px;
	}

	.desc {
		color: #CCCCCC;
		font-size: 0.75rem;
		margin: 0;
	}

	.dismiss-btn {
		background: #FFFFFF;
		color: #000000;
		border: none;
		padding: 0.75rem 2rem;
		font-size: 1rem;
		font-weight: 700;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s ease;
	}

	.dismiss-btn:hover {
		background: #CCCCCC;
	}

	.dismiss-btn:active {
		background: #999999;
	}
</style>
