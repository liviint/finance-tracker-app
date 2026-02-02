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

const addSpendingTypeColumnToCategories = async (db) => {
    const columns = await db.getAllAsync(
        `PRAGMA table_info(finance_categories);`
    );

    const hasSpendingType = columns.some((col) => col.name === "spendingType");

    if (!hasSpendingType) {
        await db.execAsync(`
            ALTER TABLE finance_categories
            ADD COLUMN spendingType TEXT 
            CHECK(spendingType IN ('neutral', 'needs', 'wants','savings'));
        `);
    } 
};

const addRecurringColumnToBudgets = async (db) => {
    const columns = await db.getAllAsync(
        `PRAGMA table_info(budgets);`
    );

    const hasRecurring = columns.some(
        (col) => col.name === "recurring"
    );

    if (!hasRecurring) {
        await db.execAsync(`
        ALTER TABLE budgets
        ADD COLUMN recurring INTEGER DEFAULT 0;
        `);
    } 
};


export const extraMigrations = async (db) => {
    await addPayeeColumnToTransactions(db);
    await addSpendingTypeColumnToCategories(db);
    await addRecurringColumnToBudgets(db)
};
