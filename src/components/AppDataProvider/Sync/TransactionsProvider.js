import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedTransactions,
  syncTransactionsFromApi,
  saveLastSyncedAt,
} from "../../../db/transactionsDb";
import {getLastSyncedAt} from "../../../db/common"
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function TransactionsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;
  
  const syncFromLocalToApi = async() => {
    const unsynced = await getUnsyncedTransactions(db);
    console.log(unsynced,"hello unsynced 123")
    if (unsynced.length > 0) {
      await api.post("/finances/transactions/bulk_sync/", {
        items: unsynced,
      });
    }
  }

  const syncFromApiToLocal = async() => {
    const lastSyncedAt = await getLastSyncedAt(db);
    try {
        const res = await api.post("/finances/transactions/sync/", {
        last_synced_at: lastSyncedAt,
      });
      console.log(res.data,"hello results 12...")

      await syncTransactionsFromApi(db, res.data.results);
      await saveLastSyncedAt(db, res.data.server_time);
    } catch (error) {
      console.log(error?.response?.data,"hello error 123")
    }
  }

  const bootstrap = async () => {
    await syncFromLocalToApi()
    await syncFromApiToLocal()
    syncManager.emit("transactions_updated");
  };

  useSyncEngine({
    enabled,
    name: "transactions",
    bootstrap,
  });

  return children;
}
