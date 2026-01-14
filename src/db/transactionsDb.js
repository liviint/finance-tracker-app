import uuid from "react-native-uuid";
import { DEFAULT_CATEGORIES } from "../../utils/categoriesSeeder";

export async function createTransaction(db, {
    title,
    amount, 
    type, 
    category = null,
    note = null,
    source = 'manual',
}) {
    try {
        const now = new Date().toISOString();
        const localUuid = uuid.v4();

        await db.runAsync(
            `INSERT INTO finance_transactions (
            uuid, title, amount, type, category, note, source,
            created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
            , [
            localUuid,
            title,
            amount,
            type,
            category,
            note,
            source,
            now,
            now,
            ]
        );
        return uuid;
    } catch (error) {
        console.log(error,"hello error creating a transaction")
    }
}

export async function getTransactions(db) {
    return await db.getAllAsync(`
        SELECT * FROM finance_transactions
        WHERE deleted_at IS NULL
        ORDER BY datetime(created_at) DESC
    `);
}

export async function getTransactionByUuid(db, uuid) {
    return await db.getFirstAsync(`
        SELECT * FROM finance_transactions
        WHERE uuid = ? AND deleted_at IS NULL
        LIMIT 1
    `, [uuid]);
}

export async function updateTransaction(db, uuid, updates = {}) {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
        fields.push("title = ?");
        values.push(updates.title);
    }

    if (updates.amount !== undefined) {
        fields.push("amount = ?");
        values.push(updates.amount);
    }

    if (updates.type !== undefined) {
        fields.push("type = ?");
        values.push(updates.type);
    }

    if (updates.category !== undefined) {
        fields.push("category = ?");
        values.push(updates.category);
    }

    if (updates.note !== undefined) {
        fields.push("note = ?");
        values.push(updates.note);
    }

    if (!fields.length) return;

    fields.push("updated_at = ?");
    values.push(new Date().toISOString());

    values.push(uuid);

    await db.runAsync(
        `UPDATE finance_transactions
        SET ${fields.join(", ")}
        WHERE uuid = ? AND deleted_at IS NULL`
        , values
    );
}

export async function deleteTransaction(db, uuid) {
    await db.runAsync(
        `UPDATE finance_transactions
        SET deleted_at = ?, updated_at = ?
        WHERE uuid = ? AND deleted_at IS NULL`
        , [
        new Date().toISOString(),
        new Date().toISOString(),
        uuid,
        ]
    );
}

export async function getTransactionStats(db) {
    const result = await db.getFirstAsync(`
        SELECT
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
        FROM finance_transactions
        WHERE deleted_at IS NULL
    `);

    const income = result?.income || 0;
    const expenses = result?.expenses || 0;

    return {
        income,
        expenses,
        balance: income - expenses,
    };
}

export async function getTopCategory(db) {
    return await db.getFirstAsync(`
        SELECT category, SUM(amount) AS total
        FROM finance_transactions
        WHERE deleted_at IS NULL
        AND type = 'expense'
        AND category IS NOT NULL
        GROUP BY category
        ORDER BY total DESC
        LIMIT 1
    `);
}

export const seedCategoriesIfEmpty = async (db) => {
    const rows = await db.getAllAsync(
        "SELECT COUNT(*) as count FROM finance_categories"
    );

    if (rows[0].count > 0) return;

    for (const cat of DEFAULT_CATEGORIES) {
        await db.runAsync(
        `INSERT INTO finance_categories 
        (uuid, name, type, color, icon)
        VALUES (?, ?, ?, ?, ?)`,
        [
            uuid.v4(),
            cat.name,
            cat.type,
            cat.color,
            cat.icon,
        ]
        );
    }
};

export const getCategories = async (db, uuid = null) => {
    if (uuid) {
        const rows = await db.getAllAsync(
        `
        SELECT *
        FROM finance_categories
        WHERE uuid = ?
            AND deleted_at IS NULL
        LIMIT 1
        `,
        [uuid]
        );

        return rows[0] || null;
    }

    return db.getAllAsync(
        `
        SELECT *
        FROM finance_categories
        WHERE deleted_at IS NULL
        ORDER BY name
        `
    );
};



export const upsertCategory = async (
  db,
  { id = null, uuid, name, type, color, icon }
) => {
  const now = new Date().toISOString();

  try {
    await db.runAsync(
      `
      INSERT INTO finance_categories (
        id,
        uuid,
        name,
        type,
        color,
        icon,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(uuid) DO UPDATE SET
        name = excluded.name,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = excluded.updated_at
      `,
      [
        id,
        uuid,
        name,
        type,
        color,
        icon,
        now,
        now,
      ]
    );

    console.log("✅ Category upserted locally");
  } catch (error) {
    console.error("❌ Failed to upsert category:", error);
  }
};



export const deleteCategory = async (db, uuid) => {
    await db.runAsync(
        `UPDATE finance_categories
        SET deleted_at = datetime('now')
        WHERE uuid = ?`,
        [uuid]
    );
};


export const getCategoriesByType = async (db, type) => {
    return db.getAllAsync(
        `
        SELECT *
        FROM finance_categories
        WHERE type = ? AND deleted_at IS NULL
        ORDER BY name
        `,
        [type]
    );
};
