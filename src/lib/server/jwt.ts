import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '$env/dynamic/private';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

function getSecretKey(): string {
	return env.INTERNAL_JWT_SECRET || 'default-internal-jwt-secret-nya-1234567890';
}

function deriveKey(secret: string): Buffer {
	return createHash('sha256').update(secret).digest();
}

/**
 * Encrypts a UUID using AES-256-GCM
 */
export function encryptUuid(uuid: string): string {
	const secret = getSecretKey();
	const key = deriveKey(secret);
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv);

	const encrypted = Buffer.concat([cipher.update(uuid, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	return Buffer.concat([iv, tag, encrypted]).toString('base64url');
}

/**
 * Decrypts a UUID encrypted with encryptUuid
 */
export function decryptUuid(data: string): string | null {
	try {
		const secret = getSecretKey();
		const key = deriveKey(secret);
		const buf = Buffer.from(data, 'base64url');

		const iv = buf.subarray(0, 12);
		const tag = buf.subarray(12, 28);
		const encrypted = buf.subarray(28);

		const decipher = createDecipheriv(ALGORITHM, key, iv);
		decipher.setAuthTag(tag);

		return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
	} catch (e) {
		console.error('Failed to decrypt UUID:', e);
		return null;
	}
}

interface JWTPayload {
	sessionId: string;
	su: string; // encrypted subpageConfigUuid
}

/**
 * Signs a JWT session token containing the encrypted config UUID
 */
export function signSessionToken(subpageConfigUuid: string | null): string {
	const secret = getSecretKey();
	const encryptedUuid = encryptUuid(subpageConfigUuid || '00000000-0000-0000-0000-000000000000');
	
	// Create sessionId (using a standard crypto random hex since nanoid isn't strictly necessary)
	const sessionId = randomBytes(16).toString('hex');

	return jwt.sign(
		{
			sessionId,
			su: encryptedUuid
		},
		secret,
		{
			expiresIn: '33m'
		}
	);
}

/**
 * Verifies a JWT session token and returns the decrypted subpageConfigUuid
 */
export function verifySessionToken(token: string): string | null {
	try {
		const secret = getSecretKey();
		const payload = jwt.verify(token, secret) as JWTPayload;
		
		if (!payload || !payload.su) {
			return null;
		}

		return decryptUuid(payload.su);
	} catch (e) {
		console.error('Session JWT verification failed:', e);
		return null;
	}
}
