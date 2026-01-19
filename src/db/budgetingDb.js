import { getMonthStart, getMonthEnd, normalizeStartDate } from "../helpers";
import uuid from 'react-native-uuid';

let newUuid = uuid.v4

export const upsertBudget = async ({
  db,
  categoryUUID,
  amount,
  period,
  date = new Date(),
}) => {
  if (!["daily", "weekly", "monthly"].includes(period)) {
    throw new Error("Invalid budget period");
  }

  if (amount <= 0) {
    throw new Error("Budget amount must be greater than zero");
  }

  const uuid = newUuid();
  const startDate = normalizeStartDate(date, period);

  await db.runAsync(
    `
    INSERT INTO budgets (
      uuid,
      category_uuid,
      amount,
      period,
      start_date
    )
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(category_uuid, period, start_date)
    DO UPDATE SET
      amount = excluded.amount,
      updated_at = CURRENT_TIMESTAMP;
    `,
    [uuid, categoryUUID, amount, period, startDate]
  );
};


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
    JOIN finance_categories c ON c.id = b.category_id
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
    FROM finance_categories c
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

export const getBudgetsForDate = async (db, date = new Date()) => {
  const day = date.toISOString().split("T")[0];

  return await db.getAllAsync(
    `
    SELECT 
      b.uuid,
      b.amount,
      b.period,
      b.start_date,
      c.name AS category_name,
      c.color,
      c.icon,
      IFNULL(SUM(t.amount), 0) AS spent
    FROM budgets b
    JOIN finance_categories c ON c.uuid = b.category_uuid
    LEFT JOIN finance_transactions t
      ON t.category_uuid = b.category_uuid
      AND t.type = 'expense'
      AND t.created_at BETWEEN
        b.start_date AND
        CASE
          WHEN b.period = 'daily' THEN b.start_date
          WHEN b.period = 'weekly' THEN date(b.start_date, '+6 days')
          WHEN b.period = 'monthly' THEN date(b.start_date, '+1 month', '-1 day')
        END
    WHERE b.start_date <= ?
    GROUP BY b.uuid
    ORDER BY b.period;
    `,
    [day]
  );
};

