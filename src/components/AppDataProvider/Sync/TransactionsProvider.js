import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";
import {
  getUnsyncedTransactions,
  syncTransactionsFromApi,
} from "../../../db/transactionsDb";
import {getLastSyncedAt, saveLastSyncedAt} from "../../../db/common"
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";
import {
  getUnsyncedTemplates,
  syncTemplatesFromApi,
} from "../../../db/transactionsTempsDb"


export default function TransactionsProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);
  const enabled = !!userDetails;
  
  const syncFromLocalToApi = async() => {
    const unsynced = await getUnsyncedTransactions(db);
    if (unsynced.length > 0) {
      await api.post("/finances/transactions/bulk_sync/", {
        items: unsynced,
      });
    }
  }

  const syncFromApiToLocal = async() => {
    const lastSyncedAt = await getLastSyncedAt(db,"transactions");
    try {
        const res = await api.post("/finances/transactions/sync/", {
        last_synced_at: lastSyncedAt,
      });

      await syncTransactionsFromApi(db, res.data.results);
      await saveLastSyncedAt(db,"transactions", res.data.server_time);
    } catch (error) {
      console.log(error?.response?.data,"hello error 123")
    }
  }

  const syncTemplatesFromLocalToApi = async () => {
    const unsynced = await getUnsyncedTemplates(db);

    if (unsynced.length > 0) {
      await api.post("/finances/transactions/templates/bulk_sync/", {
        items: unsynced,
      });
    }
  };

  const syncTemplatesFromApiToLocal = async () => {
    const lastSyncedAt = await getLastSyncedAt(db, "templates");

    try {
      const res = await api.post("/finances/transactions/templates/sync/", {
        last_synced_at: lastSyncedAt,
      });

      await syncTemplatesFromApi(db, res.data.results);
      await saveLastSyncedAt(db,"templates", res.data.server_time);
    } catch (error) {
      console.log(error?.response?.data, "templates sync error");
    }
  };

  const bootstrap = async () => {

    await syncFromLocalToApi()
    await syncFromApiToLocal()
    syncManager.emit("transactions_updated");

    await syncTemplatesFromLocalToApi();
    await syncTemplatesFromApiToLocal();
    syncManager.emit("templates_updated");

  };

  useSyncEngine({
    enabled,
    name: "transactions",
    bootstrap,
  });

  return children;
}
