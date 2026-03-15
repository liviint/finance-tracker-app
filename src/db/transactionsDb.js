import uuid from "react-native-uuid";
import { getMonthRange } from "../helpers";

const newUuid = () => uuid.v4();

export async function upsertTransaction(
  db,
  {
    uuid,
    title,
    amount,
    type,
    payee,
    category,
    category_uuid,
    note = null,
    date,
    template,
    source = "manual",
  }
) {
  const now = new Date().toISOString();
  const transactionDate = date ? date.toISOString() : now;
  amount = parseFloat(amount) || 0;

  await db.runAsync("BEGIN TRANSACTION");

  try {
    const localUuid = uuid ? uuid : newUuid();

    await db.runAsync(
      `
      INSERT INTO finance_transactions (
        uuid,
        title,
        amount,
        payee,
        type,
        category,
        category_uuid,
        note,
        source,
        created_at,
        updated_at,
        date,
        is_synced
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)

      ON CONFLICT(uuid) DO UPDATE SET
        title = excluded.title,
        amount = excluded.amount,
        payee = excluded.payee,
        type = excluded.type,
        category = excluded.category,
        category_uuid = excluded.category_uuid,
        note = excluded.note,
        updated_at = excluded.updated_at,
        date = excluded.date,
        is_synced = 0
      `,
      [
        localUuid,
        title,
        amount,
        payee,
        type,
        category,
        category_uuid,
        note,
        source,
        now,
        now,
        transactionDate,
      ]
    );

    if(template) {
      await db.runAsync(`
        UPDATE transaction_templates
        SET usage_count = usage_count + 1,
            updated_at = datetime('now')
        WHERE uuid = ?
      `, [template]);
    }

    await db.runAsync("COMMIT");
    
    return localUuid;
  } catch (error) {
    await db.runAsync("ROLLBACK");
    throw error;
  }
}


export const syncTransactionsFromApi = async (db, transactions = []) => {
    if (!Array.isArray(transactions) || transactions.length === 0) {
        return;
    }

    for (const tx of transactions) {
        const {
        uuid,
        title,
        amount,
        type,
        category,
        category_uuid,
        note,
        source,
        date,
        created_at,
        updated_at,
        deleted_at,
        } = tx;

        // 🗑️ Handle server-side soft delete
        if (deleted_at) {
        await db.runAsync(
            `
            UPDATE finance_transactions
            SET deleted_at = ?, updated_at = ?, is_synced = 1
            WHERE uuid = ?
            `,
            [deleted_at, updated_at, uuid]
        );
        continue;
        }

        // 🔁 Upsert from server
        await db.runAsync(
        `
        INSERT INTO finance_transactions (
            uuid,
            title,
            amount,
            type,
            category,
            category_uuid,
            note,
            source,
            date,
            created_at,
            updated_at,
            is_synced
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        ON CONFLICT(uuid) DO UPDATE SET
            title = excluded.title,
            amount = excluded.amount,
            type = excluded.type,
            category = excluded.category,
            category_uuid = excluded.category_uuid,
            note = excluded.note,
            source = excluded.source,
            date = excluded.date,
            updated_at = excluded.updated_at,
            deleted_at = NULL,
            is_synced = 1
        `,
        [
            uuid,
            title,
            amount,
            type,
            category,
            category_uuid,
            note,
            source,
            date,
            created_at,
            updated_at,
        ]
        );
    }

    console.log("✅ Transactions synced from API");
};

export async function getTransactions(db, date = new Date()) {
  const { start, end } = getMonthRange(date);

  return await db.getAllAsync(
    `
    SELECT *
    FROM finance_transactions t
    WHERE t.deleted_at IS NULL
      AND t.date >= ?
      AND t.date < ?
    ORDER BY datetime(t.date) DESC
    `,
    [start, end]
  );
}



export async function getTransactionByUuid(db, uuid) {
    return await db.getFirstAsync(`
        SELECT * FROM finance_transactions
        WHERE uuid = ? AND deleted_at IS NULL
        LIMIT 1
    `, [uuid]);
}

export async function getUnsyncedTransactions(db) {
    return await db.getAllAsync(
        `
        SELECT *
        FROM finance_transactions
        WHERE is_synced = 0
        `
    );
}

export async function deleteSyncedTransactions(db) {
  const result = await db.runAsync(
    `
      DELETE FROM finance_transactions
      WHERE deleted_at IS NOT NULL
      AND is_synced = 1
    `
  );
  console.log(result.changes,"hello changes")
  return result.changes; 
}

export const markTransactionsAsSynced = async (db, uuids) => {
  if (!uuids.length) return;
  const placeholders = uuids.map(() => "?").join(",");
  await db.runAsync(
    `UPDATE finance_transactions
      SET is_synced = 1
      WHERE uuid IN (${placeholders})`,
    uuids
  );
};

export async function updateTransaction(db, uuid, updates) {
    let {title,amount,type,category,note} = updates
    const fields = ['title','amount','type','category','note','updated_at = ?'];
    const values = [title,amount,type,category,note,new Date().toISOString()];
    values.push(uuid);

    await db.runAsync(
        `UPDATE finance_transactions
        SET ${fields.join(", ")}
        WHERE uuid = ? AND deleted_at IS NULL`
        , values
    );
}

export async function deleteTransaction(db, uuid) {
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE finance_transactions
      SET deleted_at = ?,
          updated_at = ?,
          is_synced = 0
      WHERE uuid = ?
        AND deleted_at IS NULL`,
    [now, now, uuid]
  );
}

export async function getTransactionStats(db, date = new Date()) {
  const { start, end } = getMonthRange(date);

  const result = await db.getFirstAsync(
    `
    SELECT
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses
    FROM finance_transactions
    WHERE deleted_at IS NULL
      AND date >= ?
      AND date < ?
    `,
    [start, end]
  );

  const income = result?.income || 0;
  const expenses = result?.expenses || 0;

  return {
    income,
    expenses,
    balance: income - expenses,
  };
}


export async function getExpenseBreakdownByCategory(db, date = new Date()) {
  const { start, end } = getMonthRange(date);

  return await db.getAllAsync(
    `
    SELECT
      c.name AS name,
      c.color AS color,
      SUM(t.amount) AS total
    FROM finance_transactions t
    JOIN finance_categories c
      ON c.uuid = t.category_uuid
    WHERE t.type = 'expense'
      AND t.deleted_at IS NULL
      AND t.date >= ?
      AND t.date < ?
    GROUP BY t.category_uuid
    ORDER BY total DESC
    `,
    [start, end]
  );
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
  { id = null, uuid, name, type, spendingType, color, icon }
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
        spendingType,
        color,
        icon,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(uuid) DO UPDATE SET
        name = excluded.name,
        spendingType = excluded.spendingType,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = excluded.updated_at
      `,
      [
        id,
        uuid,
        name,
        type,
        spendingType,
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
