<script>
	import { spring } from 'svelte/motion';

	export let item = '';
	export let index = 0;
	export let onSwipe = () => {};
	export let favoriteItem = null;
	export let hatedItem = null;

	let startX = 0;
	let startY = 0;
	let isDragging = false;

	const position = spring(
		{ x: 0, y: 0 },
		{
			stiffness: 0.3,
			damping: 0.8
		}
	);

	let currentX = 0;
	let currentY = 0;

	function handleStart(e) {
		isDragging = true;
		const touch = e.touches ? e.touches[0] : e;
		startX = touch.clientX;
		startY = touch.clientY;
	}

	function handleMove(e) {
		if (!isDragging) return;
		const touch = e.touches ? e.touches[0] : e;
		currentX = touch.clientX - startX;
		currentY = touch.clientY - startY;
		position.set({ x: currentX, y: currentY }, { hard: true });
	}

	function handleEnd() {
		isDragging = false;
		const threshold = window.innerWidth * 0.3;

		if (Math.abs(currentX) > threshold || Math.abs(currentY) > threshold) {
			let direction;
			if (Math.abs(currentX) > Math.abs(currentY)) {
				direction = currentX > 0 ? 'right' : 'left';
			} else {
				direction = currentY < 0 ? 'up' : 'down';
			}
			onSwipe(direction);
		}

		position.set({ x: 0, y: 0 });
		currentX = 0;
		currentY = 0;
	}

	$: swipeProgress = Math.min(Math.abs(currentX) / (window.innerWidth * 0.3), 1);
	$: backgroundColor = getBackgroundColor(currentX, currentY, swipeProgress);
	$: textColor = getTextColor(currentX, currentY);

	function getBackgroundColor(x, y, progress) {
		if (Math.abs(x) > Math.abs(y)) {
			// Horizontal swipe
			if (x > 0) {
				// Right swipe: green
				const g = Math.round(255 * progress);
				const r = Math.round(255 * (1 - progress));
				const b = Math.round(255 * (1 - progress));
				return `rgb(${r}, ${g}, ${b})`;
			} else {
				// Left swipe: red
				const r = Math.round(255 * progress);
				const g = Math.round(255 * (1 - progress));
				const b = Math.round(255 * (1 - progress));
				return `rgb(${r}, ${g}, ${b})`;
			}
		} else {
			// Vertical swipe
			if (y < 0) {
				// Up swipe: bright white
				const intensity = Math.round(255 * progress);
				return `rgb(${intensity}, ${intensity}, ${intensity})`;
			} else {
				// Down swipe: dark/black
				const intensity = Math.round(255 * (1 - progress));
				return `rgb(${intensity}, ${intensity}, ${intensity})`;
			}
		}
	}

	function getTextColor(x, y) {
		if (Math.abs(x) > Math.abs(y)) {
			if (x > 0) return '#00FF00';
			return '#FF0000';
		} else {
			if (y < 0) return '#FFFFFF';
			return '#333333';
		}
	}
</script>

<div
	class="swipe-card"
	style="
		transform: translate({$position.x}px, {$position.y}px);
		background-color: {backgroundColor};
		color: {textColor};
	"
	on:touchstart={handleStart}
	on:touchmove={handleMove}
	on:touchend={handleEnd}
	on:mousedown={handleStart}
	on:mousemove={handleMove}
	on:mouseup={handleEnd}
	on:mouseleave={handleEnd}
	role="button"
	tabindex="0"
>
	<div class="card-content">
		<div class="item-text">{item}</div>
	</div>
</div>

<style>
	.swipe-card {
		position: absolute;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		user-select: none;
		transition: background-color 0.05s ease;
		touch-action: none;
	}

	.swipe-card:active {
		cursor: grabbing;
	}

	.card-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
	}

	.item-text {
		font-size: 3rem;
		font-weight: 700;
		text-align: center;
		line-height: 1.2;
		max-width: 80%;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		transition: color 0.05s ease;
	}

	@media (max-width: 640px) {
		.item-text {
			font-size: 2rem;
		}
	}
</style>
