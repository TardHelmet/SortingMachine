/**
 * Encode swipe preferences into binary format
 * Direction: 'left'=0, 'right'=1, 'down'=2, 'up'=3
 * Each item uses 2 bits, 81 items = 162 bits = 21 bytes
 */
export function encodePreferences(swipeResults) {
	const directionMap = { 'left': 0, 'right': 1, 'down': 2, 'up': 3 };
	const buffer = new Uint8Array(21); // 81 items * 2 bits / 8 = 20.25, round up to 21

	for (let i = 0; i < 81; i++) {
		const direction = swipeResults.get(i) || 'left';
		const bits = directionMap[direction];

		const byteIndex = Math.floor((i * 2) / 8);
		const bitOffset = (i * 2) % 8;

		buffer[byteIndex] |= bits << (6 - bitOffset);
	}

	return buffer;
}

/**
 * Decode binary preferences back to map
 */
export function decodePreferences(buffer) {
	if (!buffer || buffer.length < 21) {
		throw new Error('Invalid preferences buffer');
	}

	const directionMap = ['left', 'right', 'down', 'up'];
	const preferences = new Map();

	for (let i = 0; i < 81; i++) {
		const byteIndex = Math.floor((i * 2) / 8);
		const bitOffset = (i * 2) % 8;

		const bits = (buffer[byteIndex] >> (6 - bitOffset)) & 0b11;
		preferences.set(i, directionMap[bits]);
	}

	return preferences;
}

/**
 * Calculate CRC16 checksum
 */
function calculateCRC16(data) {
	let crc = 0xffff;

	for (let i = 0; i < data.length; i++) {
		crc ^= data[i] << 8;
		for (let j = 0; j < 8; j++) {
			if (crc & 0x8000) {
				crc = (crc << 1) ^ 0x1021;
			} else {
				crc = crc << 1;
			}
			crc &= 0xffff;
		}
	}

	return crc;
}

/**
 * Encode full share payload
 * Format: quizId(8) + preferences(21) + favorite(1) + hated(1) + timestamp(4) + checksum(2) = 37 bytes
 */
export function encodeSharePayload(quizResult, quizId) {
	const payload = new Uint8Array(37);
	let offset = 0;

	// Quiz ID (first 8 chars, null-padded)
	const quizIdStr = quizId.slice(0, 8).padEnd(8, '\0');
	const idEncoder = new TextEncoder();
	const idBytes = idEncoder.encode(quizIdStr);
	payload.set(idBytes.slice(0, 8), offset);
	offset += 8;

	// Preferences (21 bytes)
	payload.set(quizResult.preferences, offset);
	offset += 21;

	// Favorite index (1 byte)
	payload[offset++] = quizResult.favoriteIndex & 0xff;

	// Hated index (1 byte)
	payload[offset++] = quizResult.hatedIndex & 0xff;

	// Timestamp (4 bytes, seconds)
	const timestamp = Math.floor(quizResult.completedAt / 1000);
	payload[offset++] = (timestamp >> 24) & 0xff;
	payload[offset++] = (timestamp >> 16) & 0xff;
	payload[offset++] = (timestamp >> 8) & 0xff;
	payload[offset++] = timestamp & 0xff;

	// Checksum (2 bytes)
	const checksum = calculateCRC16(payload.slice(0, 35));
	payload[offset++] = (checksum >> 8) & 0xff;
	payload[offset++] = checksum & 0xff;

	// Base64 encode and make URL-safe
	const binaryString = String.fromCharCode(...payload);
	return btoa(binaryString)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');
}

/**
 * Decode share payload from URL parameter
 */
export function decodeSharePayload(encoded) {
	try {
		// Reverse URL-safe encoding
		let base64 = encoded
			.replace(/-/g, '+')
			.replace(/_/g, '/');

		// Add padding if needed
		const padding = 4 - (base64.length % 4);
		if (padding !== 4) {
			base64 += '='.repeat(padding);
		}

		const binaryString = atob(base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		if (bytes.length !== 37) {
			throw new Error(`Invalid payload length: ${bytes.length}`);
		}

		let offset = 0;

		// Quiz ID (8 bytes)
		const quizIdBytes = bytes.slice(0, 8);
		const decoder = new TextDecoder();
		const quizId = decoder.decode(quizIdBytes).replace(/\0/g, '');
		offset += 8;

		// Preferences (21 bytes)
		const preferences = bytes.slice(offset, offset + 21);
		offset += 21;

		// Favorite index
		const favoriteIndex = bytes[offset++];

		// Hated index
		const hatedIndex = bytes[offset++];

		// Timestamp (4 bytes)
		const timestamp =
			((bytes[offset++] << 24) |
			 (bytes[offset++] << 16) |
			 (bytes[offset++] << 8) |
			 bytes[offset++]) * 1000;

		// Checksum (2 bytes)
		const storedChecksum = (bytes[34] << 8) | bytes[35];
		const calculatedChecksum = calculateCRC16(bytes.slice(0, 35));

		if (storedChecksum !== calculatedChecksum) {
			throw new Error('Checksum validation failed');
		}

		return {
			quizId,
			preferences,
			favoriteIndex,
			hatedIndex,
			completedAt: timestamp
		};
	} catch (error) {
		console.error('Decode error:', error);
		throw new Error(`Failed to decode share link: ${error.message}`);
	}
}

/**
 * Get preference at specific index
 */
export function getPreferenceAtIndex(preferences, index) {
	const directionMap = ['left', 'right', 'down', 'up'];
	const byteIndex = Math.floor((index * 2) / 8);
	const bitOffset = (index * 2) % 8;

	if (byteIndex >= preferences.length) {
		return 'left';
	}

	const bits = (preferences[byteIndex] >> (6 - bitOffset)) & 0b11;
	return directionMap[bits];
}
