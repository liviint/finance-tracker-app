import uuid from "react-native-uuid";

const newUuid = () => uuid.v4();
export const upsertDebt = async (db, debt) => {
  const {
    uuid = newUuid(),
    title,
    counterparty_name,
    counterparty_type = "person",
    amount,
    type,
    due_date,
    note,
    is_paid = 0,
  } = debt;

  await db.runAsync(
    `
    INSERT INTO debts (
      uuid,
      title,
      counterparty_name,
      counterparty_type,
      amount,
      type,
      due_date,
      note,
      is_paid,
      is_synced,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    ON CONFLICT(uuid) DO UPDATE SET
      title = excluded.title,
      counterparty_name = excluded.counterparty_name,
      counterparty_type = excluded.counterparty_type,
      amount = excluded.amount,
      type = excluded.type,
      due_date = excluded.due_date,
      note = excluded.note,
      is_paid = excluded.is_paid,
      is_synced = 0,
      updated_at = datetime('now');
    `,
    [
      uuid,
      title,
      counterparty_name,
      counterparty_type,
      amount,
      type,
      due_date,
      note,
      is_paid,
    ]
  );

  return uuid;
};

export const getAllDebts = async (db) => {
  return await db.getAllAsync(
    `
    SELECT * FROM debts
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    `
  );
};

export const getDebtsByType = async (db, type) => {
  return await db.getAllAsync(
    `
    SELECT * FROM debts
    WHERE type = ?
      AND deleted_at IS NULL
    ORDER BY due_date ASC
    `,
    [type]
  );
};

export const getDebtByUuid = async (db, uuid) => {
  return await db.getFirstAsync(
    `
    SELECT * FROM debts
    WHERE uuid = ?
      AND deleted_at IS NULL
    `,
    [uuid]
  );
};

export const deleteDebt = async (db, uuid) => {
  await db.runAsync(
    `
    UPDATE debts
    SET deleted_at = datetime('now'),
        is_synced = 0,
        updated_at = datetime('now')
    WHERE uuid = ?
    `,
    [uuid]
  );
};

export const getUnsyncedDebts = async (db) => {
  return await db.getAllAsync(
    `
    SELECT * FROM debts
    WHERE is_synced = 0
    `
  );
};

/* -------------------- Debt Payments -------------------- */

/**
 * Add a partial payment / offset for a debt
 */
export const addDebtPayment = async (db, { debt_uuid, amount, note }) => {
  const uuid =  newUuid();

  await db.runAsync(
    `
    INSERT INTO debt_payments (
      uuid,
      debt_uuid,
      amount,
      note,
      created_at,
      is_synced
    )
    VALUES (?, ?, ?, ?, datetime('now'), 0)
    `,
    [uuid, debt_uuid, amount, note || ""]
  );

  return uuid;
};

/**
 * Get all payments for a specific debt
 */
export const getPaymentsByDebt = async (db, debt_uuid) => {
  return await db.getAllAsync(
    `
    SELECT * FROM debt_payments
    WHERE debt_uuid = ?
    ORDER BY created_at ASC
    `,
    [debt_uuid]
  );
};

/**
 * Get payment stats for a debt
 */
export const getDebtStats = async (db, debt_uuid) => {
  const payments = await getPaymentsByDebt(db, debt_uuid);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const debt = await db.getFirstAsync(
    `SELECT amount FROM debts WHERE uuid = ?`,
    [debt_uuid]
  );

  const remaining = debt ? Math.max(debt.amount - totalPaid, 0) : 0;

  return { totalPaid, remaining, payments };
};