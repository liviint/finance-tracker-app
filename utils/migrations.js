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
