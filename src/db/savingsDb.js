import uuid from "react-native-uuid";
let newUuid = () => uuid.v4()

export const getSavingsGoals = async (db) => {
  return await db.getAllAsync(`
    SELECT
      g.uuid,
      g.name,
      g.target_amount,
      g.color,
      g.icon,
      g.created_at,
      g.updated_at,

      -- derived totals
      IFNULL(SUM(t.amount), 0) AS total_saved,
      COUNT(t.id) AS transactions_count,

      -- progress (0–100)
      CASE
        WHEN g.target_amount > 0
        THEN ROUND((IFNULL(SUM(t.amount), 0) / g.target_amount) * 100, 1)
        ELSE 0
      END AS progress_percent

    FROM savings_goals g
    LEFT JOIN savings_transactions t
      ON t.goal_uuid = g.uuid

    WHERE g.deleted_at IS NULL
    GROUP BY g.uuid
    ORDER BY g.created_at DESC;
  `);
};


export const getSavingsGoal = async (db, goalUuid) => {
  return await db.getFirstAsync(
    `
    SELECT
      g.uuid,
      g.name,
      g.target_amount,
      g.color,
      g.icon,
      g.created_at,
      g.updated_at,

      -- derived values
      IFNULL(SUM(t.amount), 0) AS total_saved,
      COUNT(t.id) AS transactions_count,

      CASE
        WHEN g.target_amount > 0
        THEN ROUND((IFNULL(SUM(t.amount), 0) / g.target_amount) * 100, 1)
        ELSE 0
      END AS progress_percent,

      MAX(g.target_amount - IFNULL(SUM(t.amount), 0), 0) AS remaining_amount

    FROM savings_goals g
    LEFT JOIN savings_transactions t
      ON t.goal_uuid = g.uuid

    WHERE g.uuid = ?
      AND g.deleted_at IS NULL

    GROUP BY g.uuid
    LIMIT 1;
    `,
    [goalUuid]
  );
};


export const upsertSavingsGoal = async (
    db,
    {
        uuid,
        name,
        target_amount,
        color = "#2E8B8B",
        icon = "💰",
    }
) => {
    const now = new Date().toISOString();
    const goalUuid = uuid

    await db.runAsync(
        `
        INSERT INTO savings_goals (
        uuid,
        name,
        target_amount,
        color,
        icon,
        created_at,
        updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(uuid) DO UPDATE SET
        name = excluded.name,
        target_amount = excluded.target_amount,
        color = excluded.color,
        icon = excluded.icon,
        updated_at = excluded.updated_at
        `,
        [
        goalUuid,
        name,
        target_amount,
        color,
        icon,
        now,
        now,
        ]
    );

    return goalUuid;
};

export const addToSavings = async ({
    db,
    savingsUuid,
    amount,
    note = null,
    source = "manual"
}
) => {
    if (!amount || amount <= 0) return;

    const now = new Date().toISOString();
    const transactionUuid = newUuid();

    await db.execAsync("BEGIN TRANSACTION;");

    try {
        await db.runAsync(
        `
        INSERT INTO savings_transactions (
            uuid,
            goal_uuid,
            amount,
            note,
            source,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [transactionUuid, savingsUuid, amount, note, source, now]
        );

    
        await db.runAsync(
            `
            UPDATE savings_goals
            SET current_amount = current_amount + ?,
                updated_at = ?
            WHERE uuid = ? AND deleted_at IS NULL
            `,
        [amount, now, savingsUuid]
    );

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    console.error("❌ Failed to add to savings:", error);
    throw error;
  }
};


export const removeFromSavings = async ({
  db,
  goalUuid,
  amount,
  note = null}
) => {
  if (!amount || amount <= 0) return;

  const now = new Date().toISOString();
  const transactionUuid = newUuid();

  await db.execAsync("BEGIN TRANSACTION;");

  try {
    await db.runAsync(
      `
      INSERT INTO savings_transactions (
        uuid,
        goal_uuid,
        amount,
        note,
        source,
        created_at
      )
      VALUES (?, ?, ?, ?, 'withdrawal', ?)
      `,
      [transactionUuid, goalUuid, -amount, note, now]
    );

    await db.runAsync(
      `
      UPDATE savings_goals
      SET current_amount = MAX(current_amount - ?, 0),
          updated_at = ?
      WHERE uuid = ? AND deleted_at IS NULL
      `,
      [amount, now, goalUuid]
    );

    await db.execAsync("COMMIT;");
  } catch (error) {
    await db.execAsync("ROLLBACK;");
    throw error;
  }
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

export const getSavingsTotal = async (db, goalUuid) => {
    const row = await db.getFirstAsync(
        `
        SELECT COALESCE(SUM(amount), 0) AS total
        FROM savings_transactions
        WHERE goal_uuid = ?
        `,
        [goalUuid]
    );

    return row?.total ?? 0;
};

export const getSavingsActivityStats = async (db, goalUuid) => {
    return db.getFirstAsync(
        `
        SELECT
        COUNT(*) as deposits_count,
        MAX(created_at) as last_deposit
        FROM savings_transactions
        WHERE goal_uuid = ?
        `,
        [goalUuid]
    );
};

export const getSavingsProgress = async (db, goalUuid) => {
    const goal = await getSavingsGoal(db, goalUuid);
    if (!goal) return null;

    const totalSaved = await getSavingsTotal(db, goalUuid);

    const progress = Math.min(
        (totalSaved / goal.target_amount) * 100,
        100
    );

    const remaining = Math.max(
        goal.target_amount - totalSaved,
        0
    );

    return {
        totalSaved,
        target: goal.target_amount,
        remaining,
        progress,
    };
};

export const getSavingsChartData = async (db, goalUuid) => {
    return db.getAllAsync(
        `
        SELECT
        date(created_at) as date,
        SUM(amount) as total
        FROM savings_transactions
        WHERE goal_uuid = ?
        GROUP BY date(created_at)
        ORDER BY date(created_at) ASC
        `,
        [goalUuid]
    );
};

export const getSavingsCumulativeChartData = async (db, goalUuid) => {
    const rows = await getSavingsChartData(db, goalUuid);

    let runningTotal = 0;

    return rows.map(r => {
        runningTotal += r.total;
        return {
        date: r.date,
        total: runningTotal,
        };
    });
};


export const getSavingsGoalStats = async (db, goalUuid) => {
    const goal = await getSavingsGoal(db, goalUuid);
    if (!goal) return null;

    const [progress, activity, chart] = await Promise.all([
        getSavingsProgress(db, goalUuid),
        getSavingsActivityStats(db, goalUuid),
        getSavingsCumulativeChartData(db, goalUuid),
    ]);

    return {
        goal,
        ...progress,
        depositsCount: activity.deposits_count,
        lastDeposit: activity.last_deposit,
        chartData: chart,
    };
};






