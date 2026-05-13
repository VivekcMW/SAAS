/**
 * Shared DB helpers for passkey credential storage.
 * Called lazily so the table is created on first use.
 */
import { getDb, makeId } from '~/server/utils/database'

export interface StoredCredential {
  id: string
  user_id: string
  credential_id: string
  public_key: string       // base64url-encoded COSE key
  counter: number
  transports: string       // JSON array
  created_at: string
}

export function ensurePasskeyTable() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS passkey_credentials (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      credential_id TEXT NOT NULL UNIQUE,
      public_key    TEXT NOT NULL,
      counter       INTEGER NOT NULL DEFAULT 0,
      transports    TEXT NOT NULL DEFAULT '[]',
      created_at    TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pk_cred ON passkey_credentials(credential_id);
    CREATE INDEX IF NOT EXISTS idx_pk_user ON passkey_credentials(user_id);

    CREATE TABLE IF NOT EXISTS passkey_challenges (
      id         TEXT PRIMARY KEY,
      user_id    TEXT,
      challenge  TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_pkch_expires ON passkey_challenges(expires_at);
  `)
  return db
}

export function storeChallenge(userId: string | null, challenge: string): string {
  const db = ensurePasskeyTable()
  const id = makeId('pkch')
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 min
  db.prepare(`
    INSERT INTO passkey_challenges (id, user_id, challenge, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, userId ?? null, challenge, expiresAt, now)
  return id
}

export function consumeChallenge(challengeId: string): { challenge: string; userId: string | null } | null {
  const db = ensurePasskeyTable()
  const row = db.prepare(
    `SELECT challenge, user_id, expires_at FROM passkey_challenges WHERE id = ?`
  ).get(challengeId) as { challenge: string; user_id: string | null; expires_at: string } | undefined

  if (!row) return null
  db.prepare(`DELETE FROM passkey_challenges WHERE id = ?`).run(challengeId)

  if (new Date(row.expires_at) < new Date()) return null
  return { challenge: row.challenge, userId: row.user_id }
}

export function getCredentialsByUserId(userId: string): StoredCredential[] {
  const db = ensurePasskeyTable()
  return db.prepare(`SELECT * FROM passkey_credentials WHERE user_id = ?`).all(userId) as StoredCredential[]
}

export function getCredentialById(credentialId: string): StoredCredential | null {
  const db = ensurePasskeyTable()
  return (db.prepare(`SELECT * FROM passkey_credentials WHERE credential_id = ?`).get(credentialId) as StoredCredential | undefined) ?? null
}

export function saveCredential(userId: string, credentialId: string, publicKey: string, counter: number, transports: string[]) {
  const db = ensurePasskeyTable()
  db.prepare(`
    INSERT INTO passkey_credentials (id, user_id, credential_id, public_key, counter, transports, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(makeId('pk'), userId, credentialId, publicKey, counter, JSON.stringify(transports), new Date().toISOString())
}

export function updateCredentialCounter(credentialId: string, counter: number) {
  const db = ensurePasskeyTable()
  db.prepare(`UPDATE passkey_credentials SET counter = ? WHERE credential_id = ?`).run(counter, credentialId)
}
