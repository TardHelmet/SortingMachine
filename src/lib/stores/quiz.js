import { writable, derived } from 'svelte/store';

export const currentQuiz = writable(null);
export const swipeResults = writable(new Map());
export const currentItemIndex = writable(0);
export const currentFavorite = writable(null);
export const currentHated = writable(null);
export const showTutorial = writable(false);

export const progress = derived(currentItemIndex, ($currentItemIndex) => $currentItemIndex / 81);

export const isComplete = derived(currentItemIndex, ($currentItemIndex) => $currentItemIndex >= 81);

export function resetQuiz() {
	swipeResults.set(new Map());
	currentItemIndex.set(0);
	currentFavorite.set(null);
	currentHated.set(null);
	showTutorial.set(false);
}

export function recordSwipe(universalIndex, direction) {
	swipeResults.update((map) => {
		map.set(universalIndex, direction);
		return map;
	});

	if (direction === 'up') {
		currentFavorite.set(universalIndex);
	} else if (direction === 'down') {
		currentHated.set(universalIndex);
	}

	currentItemIndex.update((n) => n + 1);
}
