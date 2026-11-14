import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

export interface TokenPayload {
  sub: string;
  email: string;
  role: 'owner' | 'staff';
  name: string;
  [key: string]: any;
}

const COOKIE_NAME = 'admin_session';

function getJwtSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'idli_and_more_bhopal_super_secure_jwt_secret_key_32chars';
  return new TextEncoder().encode(secret);
}

/**
 * Sign an edge-compatible JWT session token (12 hours validity)
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  const secret = getJwtSecretKey();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(secret);
}

/**
 * Verify an edge-compatible JWT session token
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Password hashing using bcryptjs
 */
export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 10);
}

/**
 * Password verification using bcryptjs
 */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plain, hash);
}

export { COOKIE_NAME };
