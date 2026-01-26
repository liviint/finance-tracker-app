import { SQLiteProvider } from "expo-sqlite";
import React from "react";
import { version2Migrations, version3Migrations , version4Migrations} from '../../../utils/migrations';
import TransactionsProvider from "./Sync/TransactionsProvider";
import SavingsProvider from "./Sync/SavingsProvider"
import BudgetsProvider from "./Sync/BudgetsProvider"
import CategoriesProvider from "./Sync/CategoriesProvider"

// Migration / initialization function
// Migration / initialization function
const migrateDbIfNeeded = async (db) => {
  // await db.execAsync(`DROP TABLE IF EXISTS finance_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS finance_categories;`);
  // await db.execAsync(`DROP TABLE IF EXISTS savings_goals;`);
  // await db.execAsync(`DROP TABLE IF EXISTS budgets;`);
  // await db.execAsync(`DROP TABLE IF EXISTS savings_transactions;`);
  // await db.execAsync(`DROP TABLE IF EXISTS  app_settings;`);
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
      start_date TEXT NOT NULL, -- normalized period start

      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
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

  `);
  
  if(nextVersion < 2) {
    await version2Migrations(db)
    nextVersion = 1;
  }

  if(nextVersion < 3) {
    await version3Migrations(db)
    nextVersion = 2;
  }

  if(nextVersion < 3) {
    await version4Migrations(db)
    nextVersion = 3;
  }


  await db.execAsync(
    `PRAGMA user_version = ${nextVersion};`
  );

};


export default function AppDataProvider({ children }) {
  return (
    <SQLiteProvider databaseName="zeniahub.db" onInit={migrateDbIfNeeded}>
      <CategoriesProvider />
      <TransactionsProvider />
      <SavingsProvider />
      <BudgetsProvider />
      {children}
    </SQLiteProvider>
  );
}
