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
    original_amount = amount, 
  } = debt;

  const dueDate = due_date.toISOString();

  await db.runAsync(
    `
    INSERT INTO debts (
      uuid,
      title,
      counterparty_name,
      counterparty_type,
      amount,
      original_amount,   
      type,
      due_date,
      note,
      is_paid,
      is_synced,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
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
      original_amount, 
      type,
      dueDate,
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

/**
 * Sync debts coming from API into local SQLite
 */
export const syncDebtsFromApi = async (db, debts = []) => {
  if (!debts || debts.length === 0) return;

  for (let debt of debts) {
    await db.runAsync(
      `
      INSERT INTO debts (
        uuid,
        title,
        counterparty_name,
        counterparty_type,
        amount,
        original_amount,
        type,
        due_date,
        note,
        is_paid,
        is_synced,
        deleted_at,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      ON CONFLICT(uuid) DO UPDATE SET
        title = excluded.title,
        counterparty_name = excluded.counterparty_name,
        counterparty_type = excluded.counterparty_type,
        amount = excluded.amount,
        original_amount = excluded.original_amount,
        type = excluded.type,
        due_date = excluded.due_date,
        note = excluded.note,
        is_paid = excluded.is_paid,
        deleted_at = excluded.deleted_at,
        is_synced = 1,
        updated_at = excluded.updated_at;
      `,
      [
        debt.uuid,
        debt.title,
        debt.counterparty_name,
        debt.counterparty_type,
        debt.amount,
        debt.original_amount,
        debt.type,
        debt.due_date,
        debt.note,
        debt.is_paid ? 1 : 0,
        debt.deleted_at,
        debt.created_at,
        debt.updated_at,
      ]
    );
  }
};


/**
 * Get all unsynced debt payments (local → API)
 */
export const getUnsyncedDebtPayments = async (db) => {
  return await db.getAllAsync(
    `
    SELECT * FROM debt_payments
    WHERE is_synced = 0
    `
  );
};



/**
 * Sync debt payments coming from API into local SQLite
 */
export const syncDebtPaymentsFromApi = async (db, payments = []) => {
  if (!payments || payments.length === 0) return;

  for (let payment of payments) {
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
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(uuid) DO UPDATE SET
        debt_uuid = excluded.debt_uuid,
        amount = excluded.amount,
        note = excluded.note,
        created_at = excluded.created_at,
        is_synced = 1;
      `,
      [
        payment.uuid,
        payment.debt_uuid,
        payment.amount,
        payment.note,
        payment.created_at,
      ]
    );
  }
};


export const offsetDebt = async (db, { debt_uuid, offset_amount, note }) => {
  const debt = await getDebtByUuid(db, debt_uuid);

  if (!debt) throw new Error("Debt not found");

  const remaining = debt.amount - offset_amount;

  if (remaining < 0) {
    throw new Error("Offset cannot exceed remaining debt");
  }

  await addDebtPayment(db, {
    debt_uuid,
    amount: offset_amount,
    note: note || "Offset payment",
  });

  await db.runAsync(
    `
    UPDATE debts
    SET amount = ?,
        is_paid = ?,
        is_synced = 0,
        updated_at = datetime('now')
    WHERE uuid = ?
    `,
    [remaining, remaining === 0 ? 1 : 0, debt_uuid]
  );

  return {
    remaining,
    is_paid: remaining === 0,
  };
};

export const markDebtAsPaid = async (db, debt_uuid) => {
  const debt = await getDebtByUuid(db, debt_uuid);

  if (!debt) throw new Error("Debt not found");

  if (debt.is_paid) return true;

  // Record final payment
  await addDebtPayment(db, {
    debt_uuid,
    amount: debt.amount,
    note: "Marked as fully paid",
  });

  await db.runAsync(
    `
    UPDATE debts
    SET amount = 0,
        is_paid = 1,
        is_synced = 0,
        updated_at = datetime('now')
    WHERE uuid = ?
    `,
    [debt_uuid]
  );

  return true;
};

export const markDebtAsUnpaid = async (db, debt_uuid, restoredAmount) => {
  await db.runAsync(
    `
    UPDATE debts
    SET amount = ?,
        is_paid = 0,
        is_synced = 0,
        updated_at = datetime('now')
    WHERE uuid = ?
    `,
    [restoredAmount, debt_uuid]
  );

  return true;
};


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