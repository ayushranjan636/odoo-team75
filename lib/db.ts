import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'

// For development, we'll use SQLite
const sqlite = new Database('./auth.db')
export const db = drizzle(sqlite)
