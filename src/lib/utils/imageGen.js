import { getPreferenceAtIndex } from './encoding.js';

/**
 * Generate quiz result image (9x9 grid)
 */
export async function generateQuizImage(quizResult, quizData) {
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas');
		canvas.width = 1080;
		canvas.height = 1080;
		const ctx = canvas.getContext('2d');

		// Black background
		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, 1080, 1080);

		// Draw 9x9 grid (81 items)
		const gridSize = 9;
		const cellSize = 1080 / gridSize;
		const padding = 10;
		const innerSize = cellSize - padding * 2;

		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const index = row * gridSize + col;
				const x = col * cellSize + padding;
				const y = row * cellSize + padding;

				// Get preference for this item
				const preference = getPreferenceAtIndex(quizResult.preferences, index);

				// Color mapping
				let color;
				if (index === quizResult.hatedIndex) {
					color = '#FF0000'; // Red for hated
				} else if (index === quizResult.favoriteIndex) {
					color = '#FFFFFF'; // White for favorite
				} else {
					switch (preference) {
						case 'down':
							color = '#330000'; // Dark red for hated
							break;
						case 'left':
							color = '#666666'; // Medium gray for dislike
							break;
						case 'right':
							color = '#CCCCCC'; // Light gray for like
							break;
						case 'up':
							color = '#FFFFFF'; // White for favorite
							break;
						default:
							color = '#000000';
					}
				}

				ctx.fillStyle = color;
				ctx.fillRect(x, y, innerSize, innerSize);

				// Border for favorite/hated
				if (index === quizResult.favoriteIndex) {
					ctx.strokeStyle = '#FFFFFF';
					ctx.lineWidth = 3;
					ctx.strokeRect(x - 2, y - 2, innerSize + 4, innerSize + 4);
				} else if (index === quizResult.hatedIndex) {
					ctx.strokeStyle = '#FF0000';
					ctx.lineWidth = 3;
					ctx.strokeRect(x - 2, y - 2, innerSize + 4, innerSize + 4);
				}
			}
		}

		// Draw favorite text in center overlay
		const favoriteText = quizData.items[quizResult.favoriteIndex];
		ctx.font = 'bold 32px sans-serif';
		ctx.fillStyle = '#FFFFFF';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
		ctx.shadowBlur = 8;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;

		// Wrap text if needed
		const maxWidth = 400;
		const lines = wrapText(ctx, favoriteText, maxWidth);
		const lineHeight = 40;
		const totalHeight = lines.length * lineHeight;
		const startY = 540 - totalHeight / 2;

		lines.forEach((line, i) => {
			ctx.fillText(line, 540, startY + i * lineHeight);
		});

		canvas.toBlob(
			(blob) => {
				const url = URL.createObjectURL(blob);
				resolve({
					dataUrl: url,
					blob: blob
				});
			},
			'image/png'
		);
	});
}

/**
 * Wrap text to fit within max width
 */
function wrapText(ctx, text, maxWidth) {
	const lines = [];
	const words = text.split(' ');
	let line = '';

	for (let i = 0; i < words.length; i++) {
		const testLine = line + words[i] + ' ';
		const metrics = ctx.measureText(testLine);

		if (metrics.width > maxWidth && i > 0) {
			lines.push(line.trim());
			line = words[i] + ' ';
		} else {
			line = testLine;
		}
	}

	if (line) {
		lines.push(line.trim());
	}

	return lines;
}

/**
 * Download image to device
 */
export function downloadImage(imageUrl, quizTitle) {
	const a = document.createElement('a');
	a.href = imageUrl;
	a.download = `the81-${quizTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}
