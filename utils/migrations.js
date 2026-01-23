export const version2Migrations = async (db) => {
  const columns = await db.getAllAsync(
    `PRAGMA table_info(finance_transactions);`
  );

  const hasDateColumn = columns.some(c => c.name === "date");

  if (!hasDateColumn) {
    await db.execAsync(`
      ALTER TABLE finance_transactions
      ADD COLUMN date TEXT;
    `);

    await db.execAsync(`
      UPDATE finance_transactions
      SET date = substr(created_at, 1, 10)
      WHERE date IS NULL;
    `);
  }
};

// utils/migrations.js

export const version3Migrations = async (db) => {
  console.log("🚀 Running version 2 migrations (sync columns)");

  await addIsSyncedColumn(db, "finance_transactions");
  await addIsSyncedColumn(db, "finance_categories");
  await addIsSyncedColumn(db, "budgets");
  await addIsSyncedColumn(db, "savings_goals");
  await addIsSyncedColumn(db, "savings_transactions");
};

const addIsSyncedColumn = async (db, tableName) => {
  const columns = await db.getAllAsync(
    `PRAGMA table_info(${tableName});`
  );

  const exists = columns.some(col => col.name === "is_synced");

  if (exists) {
    console.log(`ℹ️ ${tableName}.is_synced already exists`);
    return;
  }

  await db.execAsync(
    `ALTER TABLE ${tableName} ADD COLUMN is_synced INTEGER DEFAULT 0;`
  );

  console.log(`✅ Added is_synced to ${tableName}`);
};


