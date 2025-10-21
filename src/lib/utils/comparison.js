import { getPreferenceAtIndex } from './encoding.js';

/**
 * Compare two quiz results
 */
export function compareResults(userA, userB, quizItems) {
	let matchCount = 0;
	let mismatchCount = 0;
	const bigDisagrees = [];
	const perfectMatches = [];

	for (let i = 0; i < 81; i++) {
		const prefA = getPreferenceAtIndex(userA.preferences, i);
		const prefB = getPreferenceAtIndex(userB.preferences, i);

		if (prefA === prefB) {
			matchCount++;
			if (prefA === 'up' || prefA === 'down') {
				perfectMatches.push({
					item: quizItems[i],
					type: prefA === 'up' ? 'loved' : 'hated'
				});
			}
		} else {
			mismatchCount++;

			// Check for BIG DISAGREE (one's favorite is other's hated)
			if ((prefA === 'up' && prefB === 'down') || (prefA === 'down' && prefB === 'up')) {
				bigDisagrees.push({
					item: quizItems[i],
					userAFeels: prefA === 'up' ? 'loved' : 'hated',
					userBFeels: prefB === 'up' ? 'loved' : 'hated'
				});
			}
		}
	}

	// Calculate compatibility score
	let compatibilityScore = (matchCount / 81) * 60;

	// Bonus for same favorite/hated
	if (userA.favoriteIndex === userB.favoriteIndex) {
		compatibilityScore += 20;
	}
	if (userA.hatedIndex === userB.hatedIndex) {
		compatibilityScore += 10;
	}

	// Penalty for big disagreements
	compatibilityScore -= bigDisagrees.length * 10;

	// Clamp to 0-100
	compatibilityScore = Math.max(0, Math.min(100, compatibilityScore));

	return {
		score: Math.round(compatibilityScore),
		matches: matchCount,
		mismatches: mismatchCount,
		bigDisagrees,
		perfectMatches,
		flavorText: getFlavorText(Math.round(compatibilityScore))
	};
}

/**
 * Get flavor text based on compatibility score
 */
function getFlavorText(score) {
	if (score >= 95) return 'Soulmates? This is uncanny.';
	if (score >= 85) return 'You two are eerily aligned.';
	if (score >= 70) return 'Solid common ground here.';
	if (score >= 50) return 'Some good overlap, some spicy disagreements.';
	if (score >= 30) return 'Opposites attract... right?';
	return 'Well, variety is the spice of life!';
}
