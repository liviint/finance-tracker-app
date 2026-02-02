const addPayeeColumnToTransactions = async (db) => {
    const columns = await db.getAllAsync(
        `PRAGMA table_info(finance_transactions);`
    );

    const hasPayee = columns.some((col) => col.name === "payee");

    if (!hasPayee) {
        await db.execAsync(`
        ALTER TABLE finance_transactions
        ADD COLUMN payee TEXT;
        `);
    } 
};

export const extraMigrations = async (db) => {
    await addPayeeColumnToTransactions(db);
};
