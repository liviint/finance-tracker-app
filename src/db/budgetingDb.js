export const upsertBudget = async ({
  db,
  categoryId,
  amount,
  startDate,
}) => {
  if (!amount || amount <= 0) {
    throw new Error("Budget amount must be greater than zero");
  }

  const uuid = generateUUID();

  await db.runAsync(
    `
    INSERT INTO budgets (
      uuid,
      category_id,
      amount,
      period,
      start_date
    )
    VALUES (?, ?, ?, 'monthly', ?)
    ON CONFLICT(category_id, period, start_date)
    DO UPDATE SET
      amount = excluded.amount,
      updated_at = CURRENT_TIMESTAMP;
    `,
    [uuid, categoryId, amount, startDate]
  );
};

import { getMonthStart, getMonthEnd } from "./helpers/date";

export const getBudgetsForMonth = async (db, date = new Date()) => {
  const startDate = getMonthStart(date);
  const endDate = getMonthEnd(date);

  return await db.getAllAsync(
    `
    SELECT 
      b.uuid,
      b.amount AS budget_amount,
      b.start_date,
      c.id AS category_id,
      c.name AS category_name,
      c.icon,
      c.color,
      IFNULL(SUM(t.amount), 0) AS spent
    FROM budgets b
    JOIN categories c ON c.id = b.category_id
    LEFT JOIN transactions t
      ON t.category_id = b.category_id
      AND t.date BETWEEN ? AND ?
    WHERE b.start_date = ?
    GROUP BY b.uuid
    ORDER BY c.name ASC;
    `,
    [startDate, endDate, startDate]
  );
};


export const getBudgetByUUID = async (db, uuid) => {
  const rows = await db.getAllAsync(
    `
    SELECT *
    FROM budgets
    WHERE uuid = ?
    LIMIT 1;
    `,
    [uuid]
  );

  return rows[0] || null;
};


export const deleteBudget = async (db, uuid) => {
  await db.runAsync(
    `
    DELETE FROM budgets
    WHERE uuid = ?;
    `,
    [uuid]
  );
};


export const categoryHasBudget = async ({
  db,
  categoryId,
  startDate,
}) => {
  const rows = await db.getAllAsync(
    `
    SELECT uuid
    FROM budgets
    WHERE category_id = ?
      AND period = 'monthly'
      AND start_date = ?
    LIMIT 1;
    `,
    [categoryId, startDate]
  );

  return rows.length > 0;
};


export const getCategoriesWithoutBudget = async ({
  db,
  startDate,
}) => {
  return await db.getAllAsync(
    `
    SELECT c.*
    FROM categories c
    WHERE c.id NOT IN (
      SELECT category_id
      FROM budgets
      WHERE start_date = ?
        AND period = 'monthly'
    )
    ORDER BY c.name ASC;
    `,
    [startDate]
  );
};


export const getBudgetStatus = (spent, budget) => {
  if (budget <= 0) return "safe";

  const usage = spent / budget;

  if (usage <= 0.7) return "safe";
  if (usage <= 0.9) return "warning";
  if (usage <= 1) return "critical";
  return "over";
};
