import { openDB } from 'idb';

const DB_NAME = 'the81';
const DB_VERSION = 1;

/**
 * Initialize IndexedDB with fallback to localStorage
 */
export async function initDB() {
	try {
		return await openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('results')) {
					db.createObjectStore('results', { keyPath: 'quizId' });
				}
			}
		});
	} catch (error) {
		console.warn('IndexedDB unavailable, falling back to localStorage', error);
		return null;
	}
}

/**
 * Save quiz result
 */
export async function saveResult(quizId, result) {
	try {
		const db = await initDB();
		if (db) {
			await db.put('results', {
				quizId,
				completedAt: Date.now(),
				result
			});
		} else {
			// Fallback to localStorage
			const key = `result_${quizId}`;
			localStorage.setItem(key, JSON.stringify({
				quizId,
				completedAt: Date.now(),
				result
			}));
		}
	} catch (error) {
		console.error('Error saving result:', error);
		throw new Error('Failed to save quiz result');
	}
}

/**
 * Get quiz result
 */
export async function getResult(quizId) {
	try {
		const db = await initDB();
		if (db) {
			return await db.get('results', quizId);
		} else {
			// Fallback to localStorage
			const key = `result_${quizId}`;
			const stored = localStorage.getItem(key);
			return stored ? JSON.parse(stored) : null;
		}
	} catch (error) {
		console.error('Error retrieving result:', error);
		return null;
	}
}

/**
 * Check if quiz is completed
 */
export async function hasCompleted(quizId) {
	const result = await getResult(quizId);
	return !!result;
}

/**
 * Get all results
 */
export async function getAllResults() {
	try {
		const db = await initDB();
		if (db) {
			return await db.getAll('results');
		} else {
			// Fallback to localStorage
			const results = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith('result_')) {
					const stored = localStorage.getItem(key);
					if (stored) {
						results.push(JSON.parse(stored));
					}
				}
			}
			return results;
		}
	} catch (error) {
		console.error('Error retrieving all results:', error);
		return [];
	}
}

/**
 * Clear all results (for testing)
 */
export async function clearAllResults() {
	try {
		const db = await initDB();
		if (db) {
			const store = db.transaction('results', 'readwrite').store;
			await store.clear();
		} else {
			// Fallback to localStorage
			const keysToDelete = [];
			for (let i = 0; i < localStorage.length; i++) {
				const key = localStorage.key(i);
				if (key?.startsWith('result_')) {
					keysToDelete.push(key);
				}
			}
			keysToDelete.forEach(key => localStorage.removeItem(key));
		}
	} catch (error) {
		console.error('Error clearing results:', error);
	}
}
