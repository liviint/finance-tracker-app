import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedSavingsGoals,
  getUnsyncedSavingsTransactions,
  syncSavingsGoalsFromApi,
  syncSavingsTransactionsFromApi,
  getSavingsLastSyncedAt,
  saveSavingsLastSyncedAt,
} from "../../db/savingsDb";

import { api } from "../../../api";
import { syncManager } from "../../../utils/syncManager";
import { useSyncEngine } from "../../../utils/useSyncEngine";

export default function SavingsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;

  const bootstrap = async () => {
    // ─────────────────────────────
    // 1️⃣ PUSH: local → server
    // ─────────────────────────────
    const unsyncedGoals = await getUnsyncedSavingsGoals(db);
    if (unsyncedGoals.length > 0) {
      await api.post("/finances/savings/goals/bulk-sync/", {
        items: unsyncedGoals,
      });
    }

    const unsyncedTransactions = await getUnsyncedSavingsTransactions(db);
    if (unsyncedTransactions.length > 0) {
      await api.post("/finances/savings/transactions/bulk-sync/", {
        items: unsyncedTransactions,
      });
    }

    // ─────────────────────────────
    // 2️⃣ PULL: server → local
    // ─────────────────────────────
    const lastSyncedAt = await getSavingsLastSyncedAt(db);

    const res = await api.post("/finances/savings/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncSavingsGoalsFromApi(db, res.data.goals);
    await syncSavingsTransactionsFromApi(db, res.data.transactions);

    await saveSavingsLastSyncedAt(db, res.data.server_time);

    syncManager.emit("savings_updated");
  };

  useSyncEngine({
    enabled,
    name: "savings",
    bootstrap,
  });

  return children;
}
