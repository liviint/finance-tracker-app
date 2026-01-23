import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedBudgets,
  syncBudgetsFromApi,
  getBudgetsLastSyncedAt,
  saveBudgetsLastSyncedAt,
} from "../../../db/budgetingDb";
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function BudgetsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;

  const bootstrap = async () => {
    // ─────────────────────────────
    // 1️⃣ PUSH: local → server
    // ─────────────────────────────
    const unsynced = await getUnsyncedBudgets(db);
    if (unsynced.length > 0) {
      await api.post("/finances/budgets/bulk-sync/", {
        items: unsynced,
      });
    }

    // ─────────────────────────────
    // 2️⃣ PULL: server → local
    // ─────────────────────────────
    const lastSyncedAt = await getBudgetsLastSyncedAt(db);

    const res = await api.post("/finances/budgets/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncBudgetsFromApi(db, res.data.results);
    await saveBudgetsLastSyncedAt(db, res.data.server_time);

    syncManager.emit("budgets_updated");
  };

  useSyncEngine({
    enabled,
    name: "budgets",
    bootstrap,
  });

  return children;
}
