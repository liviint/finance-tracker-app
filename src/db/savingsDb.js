import uuid from "react-native-uuid";
let newUuid = uuid.v4

export const getSavingsGoals = async (db) => {
    return db.getAllAsync(`
        SELECT *
        FROM savings_goals
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    `);
};

export const getSavingsGoal = async (db, uuid) => {
    return db.getFirstAsync(
        `
        SELECT *
        FROM savings_goals
        WHERE uuid = ? AND deleted_at IS NULL
        `,
        [uuid]
    );
};

export const upsertSavingsGoal = async (
    db,
    {
        uuid,
        name,
        target_amount,
        current_amount,
        color = "#2E8B8B",
        icon = "💰",
    }
) => {
    const now = new Date().toISOString();
    const goalUuid = uuid || newUuid();

    await db.runAsync(
        `
        INSERT INTO savings_goals (
        uuid,
        name,
        target_amount,
        current_amount,
        color,
        icon,
        created_at,
        updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(uuid) DO UPDATE SET
        name = excluded.name,
        target_amount = excluded.target_amount,
        current_amount = excluded.current_amount,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = excluded.updated_at
        `,
        [
        goalUuid,
        name,
        target_amount,
        current_amount,
        color,
        icon,
        now,
        now,
        ]
    );

    return goalUuid;
};

export const addToSavings = async (db, uuid, amount) => {
    if (!amount || amount <= 0) return;

    await db.runAsync(
        `
        UPDATE savings_goals
        SET current_amount = current_amount + ?,
            updated_at = ?
        WHERE uuid = ? AND deleted_at IS NULL
        `,
        [amount, new Date().toISOString(), uuid]
    );
};

export const removeFromSavings = async (db, uuid, amount) => {
    if (!amount || amount <= 0) return;

    await db.runAsync(
        `
        UPDATE savings_goals
        SET current_amount = MAX(current_amount - ?, 0),
            updated_at = ?
        WHERE uuid = ? AND deleted_at IS NULL
        `,
        [amount, new Date().toISOString(), uuid]
    );
};

export const deleteSavingsGoal = async (db, uuid) => {
    await db.runAsync(
        `
        UPDATE savings_goals
        SET deleted_at = ?, updated_at = ?
        WHERE uuid = ?
        `,
        [new Date().toISOString(), new Date().toISOString(), uuid]
    );
};

export const resetSavings = async (db, uuid) => {
    await db.runAsync(
        `
        UPDATE savings_goals
        SET current_amount = 0,
            updated_at = ?
        WHERE uuid = ? AND deleted_at IS NULL
        `,
        [new Date().toISOString(), uuid]
    );
};
