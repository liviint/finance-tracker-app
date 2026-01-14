import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import TransactionsProvider from "./TransactionsProvider"

// Migration / initialization function
// Migration / initialization function
const migrateDbIfNeeded = async (db) => {
  // await db.execAsync(`DROP TABLE IF EXISTS finance_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS finance_categories;`);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS finance_transactions (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,

      title TEXT NOT NULL,
      amount REAL NOT NULL, 
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      category TEXT,
      category_uuid TEXT,
      note TEXT,

      source TEXT DEFAULT 'manual',

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_finance_created_at
    ON finance_transactions(created_at);

    CREATE INDEX IF NOT EXISTS idx_finance_type
    ON finance_transactions(type);

    CREATE TABLE IF NOT EXISTS finance_categories (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,

      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),

      color TEXT,
      icon TEXT,

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );

CREATE INDEX IF NOT EXISTS idx_categories_type
ON finance_categories(type);


  `);
};


export default function AppDataProvider({ children }) {
  return (
    <SQLiteProvider databaseName="zeniahub.db" onInit={migrateDbIfNeeded}>
      <TransactionsProvider />
      {children}
    </SQLiteProvider>
  );
}
