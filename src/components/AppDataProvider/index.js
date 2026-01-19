import React from "react";
import { SQLiteProvider } from "expo-sqlite";
import TransactionsProvider from "./TransactionsProvider"

// Migration / initialization function
// Migration / initialization function
const migrateDbIfNeeded = async (db) => {
  // await db.execAsync(`DROP TABLE IF EXISTS finance_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS finance_categories;`);
  // await db.execAsync(`DROP TABLE IF EXISTS savings_goals;`);
  // await db.execAsync(`DROP TABLE IF EXISTS budgets;`);
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
      date TEXT NOT NULL,
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

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS savings_goals (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      color TEXT,
      icon TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,

      category_uuid TEXT NOT NULL,
      amount REAL NOT NULL,

      period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
      start_date TEXT NOT NULL, -- normalized period start

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,

      UNIQUE (category_uuid, period, start_date),

      FOREIGN KEY (category_uuid)
        REFERENCES finance_categories(uuid)
        ON DELETE CASCADE
    );


    CREATE INDEX IF NOT EXISTS idx_budgets_category
    ON budgets(category_uuid);

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
