import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import {
  getUnsyncedBudgets,
  syncBudgetsFromApi,
} from "../../../db/budgetingDb";
import {getLastSyncedAt,saveLastSyncedAt} from "../../../db/common"
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function BudgetsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;

  const syncFromLocalToApi = async() => {
    try {
      const unsynced = await getUnsyncedBudgets(db);
      if (unsynced.length > 0) {
        await api.post("/finances/budgets/bulk_sync/", {
          items: unsynced,
        });
      }
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const syncFromApiToLocal = async() => {
    try {
      const lastSyncedAt = await getLastSyncedAt(db,"budgets");

      const res = await api.post("/finances/budgets/sync/", {
        last_synced_at: lastSyncedAt,
      });

      await syncBudgetsFromApi(db, res.data.results);
      await saveLastSyncedAt(db,"budgets", res.data.server_time);
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const bootstrap = async () => {
    await syncFromLocalToApi()
    await syncFromApiToLocal()
    syncManager.emit("budgets_updated");
  };

  useSyncEngine({
    enabled,
    name: "budgets",
    bootstrap,
  });

  return children;
}
