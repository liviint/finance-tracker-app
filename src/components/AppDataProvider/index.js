import { SQLiteProvider } from "expo-sqlite";
import React from "react";
import TransactionsProvider from "./Sync/TransactionsProvider";
import SavingsProvider from "./Sync/SavingsProvider"
import BudgetsProvider from "./Sync/BudgetsProvider"
import CategoriesProvider from "./Sync/CategoriesProvider"
import DebtsProvider from "./Sync/DebtsProvider"
import { extraMigrations } from "./migrations"

const migrateDbIfNeeded = async (db) => {
  // await db.execAsync(`DROP TABLE IF EXISTS finance_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS finance_categories;`);
  // await db.execAsync(`DROP TABLE IF EXISTS savings_goals;`);
  // await db.execAsync(`DROP TABLE IF EXISTS budgets;`);
  // await db.execAsync(`DROP TABLE IF EXISTS savings_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS  app_settings;`);
  // await db.execAsync(`DROP TABLE IF EXISTS  debts;`);
  // await db.execAsync(`DROP TABLE IF EXISTS  debt_payments;`);
  // await db.execAsync(`PRAGMA user_version = 0;`);


  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  const result = await db.getFirstAsync(
    `PRAGMA user_version;`
  );

  const currentVersion = result.user_version ?? 0;

  let nextVersion = currentVersion;

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
      payee Text,

      source TEXT DEFAULT 'manual',

      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      date TEXT NOT NULL,
      deleted_at TEXT,
      is_synced INTEGER DEFAULT 0
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
      spendingType TEXT DEFAULT 'neutral' CHECK(spendingType IN ('neutral', 'needs', 'wants','savings')),

      color TEXT,
      icon TEXT,

      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      is_synced INTEGER DEFAULT 0
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
      deleted_at TEXT,
      is_synced INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER,
      uuid TEXT UNIQUE PRIMARY KEY,

      category_uuid TEXT NOT NULL,
      amount REAL NOT NULL,

      period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
      recurring INTEGER DEFAULT 0,
      start_date TEXT NOT NULL, 

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT DEFAULT NULL,
      is_synced INTEGER DEFAULT 0,

      FOREIGN KEY (category_uuid)
        REFERENCES finance_categories(uuid)
        ON DELETE CASCADE
    );


    CREATE INDEX IF NOT EXISTS idx_budgets_category
    ON budgets(category_uuid);

    CREATE TABLE IF NOT EXISTS savings_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT UNIQUE NOT NULL,

      goal_uuid TEXT NOT NULL,
      amount REAL NOT NULL,

      note TEXT,
      source TEXT DEFAULT 'manual',

      created_at TEXT NOT NULL,
      is_synced INTEGER DEFAULT 0,

      FOREIGN KEY (goal_uuid)
        REFERENCES savings_goals(uuid)
        ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_savings_transactions_goal
    ON savings_transactions(goal_uuid);

    CREATE INDEX IF NOT EXISTS idx_savings_transactions_created_at
    ON savings_transactions(created_at);

    
  CREATE TABLE IF NOT EXISTS debts (
    id INTEGER,
    uuid TEXT PRIMARY KEY,
    title TEXT NOT NULL,

    counterparty_name TEXT NOT NULL,
    counterparty_type TEXT CHECK(counterparty_type IN ('person', 'company')) DEFAULT 'person',

    amount REAL NOT NULL,
    original_amount REAL NOT NULL,
    type TEXT CHECK(type IN ('owed', 'owing')) NOT NULL,

    due_date TEXT,
    note TEXT,
    is_paid INTEGER DEFAULT 0,

    is_synced INTEGER DEFAULT 0,
    deleted_at TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS debt_payments (
    id INTEGER,
    uuid TEXT PRIMARY KEY,
    debt_uuid TEXT NOT NULL,           
    amount REAL NOT NULL,              
    note TEXT,                         
    created_at TEXT DEFAULT (datetime('now')),
    is_synced INTEGER DEFAULT 0,       
    FOREIGN KEY (debt_uuid) REFERENCES debts(uuid)
  );

  `);

  await db.execAsync(
    `PRAGMA user_version = ${nextVersion};`
  );

  extraMigrations(db)
};


export default function AppDataProvider({ children }) {
  return (
    <SQLiteProvider databaseName="zeniahub.db" onInit={migrateDbIfNeeded}>
      <CategoriesProvider />
      <TransactionsProvider />
      <SavingsProvider />
      <BudgetsProvider />
      <DebtsProvider />
      {children}
    </SQLiteProvider>
  );
}
