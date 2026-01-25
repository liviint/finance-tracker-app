import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedSavingsGoals,
  getUnsyncedSavingsTransactions,
  syncSavingsGoalsFromApi,
  syncSavingsTransactionsFromApi,
} from "../../../db/savingsDb";
import {getLastSyncedAt,saveLastSyncedAt} from "../../../db/common"
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function SavingsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;
  
  const syncGoalsFromLocalToApi = async() => {
    try {
      const unsyncedGoals = await getUnsyncedSavingsGoals(db);
      if (unsyncedGoals.length > 0) {
        let res = await api.post("/finances/savings/goals/bulk_sync/", {
          items: unsyncedGoals,
        });
      }
    } catch (error) {
      console.log(error,"hello error")
    }
  }
  const syncTransactionsFromLocalToApi = async() => {
    try {
      const unsyncedTransactions = await getUnsyncedSavingsTransactions(db);
      if (unsyncedTransactions.length > 0) {
        let res = await api.post("/finances/savings/transactions/bulk_sync/", {
          items: unsyncedTransactions,
        });
      }
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const syncGoalsFromApiToLocal = async() => {
    const lastSyncedAt = await getLastSyncedAt(db,"savings-goals");
    try {
        const res = await api.post("/finances/savings/goals/sync/", {
        last_synced_at: lastSyncedAt,
      });
      await syncSavingsGoalsFromApi(db, res.data.results);
      await saveLastSyncedAt(db, res.data.server_time,"savings-goals");
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const syncTransationsFromApiToLocal = async() => {
    const lastSyncedAt = await getLastSyncedAt(db,"savings-transactions");
    try {
        const res = await api.post("/finances/savings/transactions/sync/", {
        last_synced_at: lastSyncedAt,
      });
      await syncSavingsTransactionsFromApi(db, res.data.results);
      await saveLastSyncedAt(db, res.data.server_time,"savings-transactions");
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const bootstrap = async () => {
    await syncGoalsFromLocalToApi()
    await syncTransactionsFromLocalToApi()

    await syncGoalsFromApiToLocal()
    await syncTransationsFromApiToLocal()

    syncManager.emit("savings_updated");
  };

  useSyncEngine({
    enabled,
    name: "savings",
    bootstrap,
  });

  return children;
}
