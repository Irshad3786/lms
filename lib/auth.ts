import crypto from 'crypto';

const SECRET = process.env.JWT_SECRET || 'super-secret-leave-management-key-12345';

// Hashes a plain text password using SHA-256
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Encodes a payload and signs it to return a JWT token string
export function signToken(payload: { id: string; email: string; role: string; name: string }): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  
  // Set an expiration claim (7 days)
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  const payloadWithExp = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(payloadWithExp)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
    
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Verifies a JWT token and returns its decoded payload, or null if invalid
export function verifyToken(token: string): { id: string; email: string; role: string; name: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');
      
    if (signature !== expectedSignature) return null;
    
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    
    // Check expiration
    if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    
    return {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
      name: decodedPayload.name,
    };
  } catch {
    return null;
  }
}
