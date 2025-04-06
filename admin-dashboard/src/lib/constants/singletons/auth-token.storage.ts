import { AUTH_TOKEN_ENCRYPTION_KEY } from '@/lib/constants/keys'
import Dexie from 'dexie'

class TokenDatabase extends Dexie {
  tokens: Dexie.Table<{ id: number; data: ArrayBuffer }, number>

  constructor() {
    super('TokenDB')
    this.version(1).stores({
      tokens: '++id',
    })
    this.tokens = this.table('tokens')
  }
}

class TokenStorage {
  private db = new TokenDatabase()
  private key: CryptoKey | null = null

  constructor() {
    this.initializeKey()
  }

  private async initializeKey() {
    const existingKey = await this.getKeyFromStorage()
    this.key = existingKey || (await this.generateAndStoreKey())
  }

  private async generateAndStoreKey(): Promise<CryptoKey> {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
      'encrypt',
      'decrypt',
    ])

    const exportedKey = await crypto.subtle.exportKey('raw', key)
    localStorage.setItem(
      AUTH_TOKEN_ENCRYPTION_KEY,
      btoa(String.fromCharCode(...new Uint8Array(exportedKey))),
    )
    return key
  }

  private async getKeyFromStorage(): Promise<CryptoKey | null> {
    const storedKey = localStorage.getItem(AUTH_TOKEN_ENCRYPTION_KEY)
    if (!storedKey) return null

    const keyBuffer = Uint8Array.from(atob(storedKey), (c) => c.charCodeAt(0))
    return crypto.subtle.importKey('raw', keyBuffer, { name: 'AES-GCM' }, true, [
      'encrypt',
      'decrypt',
    ])
  }

  private async encryptData(data: string): Promise<ArrayBuffer> {
    if (!this.key) throw new Error('Encryption key is not initialized')

    const encoder = new TextEncoder()
    const encodedData = encoder.encode(data)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, encodedData)

    return this.concatBuffers(iv, encrypted)
  }

  private async decryptData(encryptedData: ArrayBuffer): Promise<string> {
    if (!this.key) throw new Error('Decryption key is not initialized')

    const iv = encryptedData.slice(0, 12)
    const data = encryptedData.slice(12)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      this.key,
      data,
    )

    return new TextDecoder().decode(decrypted)
  }

  private concatBuffers(iv: Uint8Array, data: ArrayBuffer): ArrayBuffer {
    const merged = new Uint8Array(iv.length + data.byteLength)
    merged.set(iv, 0)
    merged.set(new Uint8Array(data), iv.length)
    return merged.buffer
  }

  async saveToken(token: string): Promise<void> {
    const encryptedData = await this.encryptData(token)
    await this.db.tokens.clear() // Store only one token at a time
    await this.db.tokens.add({ id: 1, data: encryptedData })
  }

  async getToken(): Promise<string | null> {
    const record = await this.db.tokens.get(1)
    return record ? await this.decryptData(record.data) : null
  }

  async clearToken(): Promise<void> {
    await this.db.tokens.clear()
  }
}

export const tokenStorage = new TokenStorage()
