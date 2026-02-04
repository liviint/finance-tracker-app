import { v4 as uuidv4 } from "uuid";

/* ============================================================
   ✅ UPSERT Template (Create or Update)
============================================================ */
export const upsertTransactionTemplate = async (db, template) => {
  const {
    uuid = uuidv4(),

    title,
    amount,
    type,

    category = null,
    category_uuid = null,

    payee = null,
    note = null,

    created_at = new Date().toISOString(),
    updated_at = new Date().toISOString(),

    deleted_at = null,
    is_synced = 0,
  } = template;

  await db.runAsync(
    `
    INSERT INTO transaction_templates (
      uuid,
      title,
      amount,
      type,
      category,
      category_uuid,
      payee,
      note,
      created_at,
      updated_at,
      deleted_at,
      is_synced
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)

    ON CONFLICT(uuid) DO UPDATE SET
      title = excluded.title,
      amount = excluded.amount,
      type = excluded.type,
      category = excluded.category,
      category_uuid = excluded.category_uuid,
      payee = excluded.payee,
      note = excluded.note,
      updated_at = excluded.updated_at,
      deleted_at = excluded.deleted_at,
      is_synced = excluded.is_synced
    `,
    [
      uuid,
      title,
      amount,
      type,
      category,
      category_uuid,
      payee,
      note,
      created_at,
      updated_at,
      deleted_at,
      is_synced,
    ]
  );

  return uuid;
};

/* ============================================================
   ✅ GET All Templates
============================================================ */
export const getTransactionTemplates = async (db) => {
  return await db.getAllAsync(`
    SELECT *
    FROM transaction_templates
    WHERE deleted_at IS NULL
    ORDER BY updated_at DESC
  `);
};

/* ============================================================
   ✅ GET Single Template by UUID
============================================================ */
export const getTransactionTemplateByUuid = async (db, uuid) => {
  return await db.getFirstAsync(
    `
    SELECT *
    FROM transaction_templates
    WHERE uuid = ?
      AND deleted_at IS NULL
    `,
    [uuid]
  );
};

/* ============================================================
   ✅ Soft Delete Template
============================================================ */
export const deleteTransactionTemplate = async (db, uuid) => {
  await db.runAsync(
    `
    UPDATE transaction_templates
    SET deleted_at = datetime('now'),
        updated_at = datetime('now'),
        is_synced = 0
    WHERE uuid = ?
    `,
    [uuid]
  );
};

/* ============================================================
   ✅ Restore Template (Undo Delete)
============================================================ */
export const restoreTransactionTemplate = async (db, uuid) => {
  await db.runAsync(
    `
    UPDATE transaction_templates
    SET deleted_at = NULL,
        updated_at = datetime('now'),
        is_synced = 0
    WHERE uuid = ?
    `,
    [uuid]
  );
};

/* ============================================================
   ✅ Mark Template as Synced
============================================================ */
export const markTemplateAsSynced = async (db, uuid) => {
  await db.runAsync(
    `
    UPDATE transaction_templates
    SET is_synced = 1,
        updated_at = datetime('now')
    WHERE uuid = ?
    `,
    [uuid]
  );
};

/* ============================================================
   ✅ Get Unsynced Templates (for API Sync)
============================================================ */
export const getUnsyncedTemplates = async (db) => {
  return await db.getAllAsync(`
    SELECT *
    FROM transaction_templates
    WHERE is_synced = 0
      AND deleted_at IS NULL
  `);
};

/* ============================================================
   ✅ Permanently Delete (Only if Needed)
============================================================ */
export const hardDeleteTransactionTemplate = async (db, uuid) => {
  await db.runAsync(
    `
    DELETE FROM transaction_templates
    WHERE uuid = ?
    `,
    [uuid]
  );
};
