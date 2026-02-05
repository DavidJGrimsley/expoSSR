import crypto from 'crypto';
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// ============================================================================
// SERVER-SIDE ONLY: This entire file runs exclusively on the Node.js server
// during HTML rendering. The crypto operations prove this is server-executed.
// ============================================================================

/**
 * Generates a cryptographically signed session token that proves server-side
 * code execution. The signature can only be created with the server's secret.
 * 
 * WHAT IS A SIGNATURE?
 * A signature is proof that data came from a trusted source. It's created by:
 * 1. Taking your data (the payload)
 * 2. Mixing it with a secret key using HMAC-SHA256 (a mathematical algorithm)
 * 3. Producing a unique code (the signature)
 * 
 * Only the server (with the secret key) can create a valid signature.
 * If data is changed after signing, the signature becomes invalid.
 * It's like a tamper-evident seal on an envelope.
 * 
 * WHAT IS BASE64?
 * Base64 is a way to encode data as text using 64 "safe" characters (A-Z, a-z, 0-9, +, /).
 * It's not encryption—it's just a different format. Anyone can decode it.
 * We use it because HTML attributes need text, not binary data.
 * Example: {id:123} → eyJpZCI6MTIzfQ==
 * 
 * WHY IS THIS SECURE?
 * - The signature requires the server's secret (in .env)
 * - The client can see the Base64 token, but can't create a valid signature
 * - If someone modifies the data, the signature becomes invalid
 * - Every request generates a new nonce (random UUID), proving fresh server execution
 */
function generateSignedSessionToken(): string {
  // Generate payload with timestamp and random nonce
  const payload = {
    issuedAt: Date.now(),
    nonce: crypto.randomUUID(),
  };

  // Load secret key from .env file
  // In production: Load from AWS Secrets Manager, Heroku Config Vars, Azure Key Vault, etc.
  // The secret should be a strong random string (at least 32 characters)
  const SECRET = process.env.SESSION_SECRET || 'demo-secret-key';

  // Sign payload using HMAC SHA256
  // This creates a signature that proves this payload came from the server
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Create combined token with both payload and signature
  const token = {
    payload,
    signature,
  };

  // Base64 encode for safe embedding in HTML meta tag
  // This converts the JSON to a text format that's safe to put in HTML attributes
  const encoded = Buffer.from(JSON.stringify(token)).toString('base64');
  return encoded;
}

// This file only runs on the server while rendering HTML for web.
export default function Root({ children }: PropsWithChildren) {
  // Generate signed token at render time
  const sessionToken = generateSignedSessionToken();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* 
          PROOF OF SERVER EXECUTION: This meta tag contains a Base64-encoded token.
          
          Inside the Base64:
          - payload: {issuedAt, nonce} — data generated on the server
          - signature: HMAC-SHA256 hash created with the server's secret key
          
          Why this proves server execution:
          - The signature requires the server's secret (stored in .env, never sent to client)
          - Client can see the Base64 token but can't create a valid signature without the secret
          - Every reload generates a new nonce + signature, proving this code ran on the server
          - If anyone modifies the Base64 content, the signature becomes invalid
        */}
        <meta name="x-session" content={sessionToken} />

        {/* Disable body scrolling to make ScrollView behave like on native by default */}
        <ScrollViewStyleReset />

        {/* Add any global head elements for all pages here */}
      </head>
      <body>{children}</body>
    </html>
  );
}
