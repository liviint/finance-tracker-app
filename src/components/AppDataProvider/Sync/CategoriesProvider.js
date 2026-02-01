import { useSelector } from "react-redux";
import { useSQLiteContext } from "expo-sqlite";

import {
  getUnsyncedCategories,
  syncCategoriesFromApi,
  seedCategoriesIfEmpty,
} from "../../../db/categoriesDb";
import {getLastSyncedAt, saveLastSyncedAt} from "../../../db/common"
import { api } from "../../../../api";
import { syncManager } from "../../../../utils/syncManager";
import { useSyncEngine } from "../../../../src/hooks/useSyncEngine";

export default function CategoriesProvider({ children }) {
  const db = useSQLiteContext();
  const userDetails = useSelector((state) => state?.user?.userDetails);

  const syncFromLocalToApi = async() => {
    try {
      const unsynced = await getUnsyncedCategories(db);
      if (unsynced.length > 0) {
        await api.post("/finances/categories/bulk_sync/", {
          items: unsynced,
        });
      }
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const syncFromApiToLocal =  async() => {
    const lastSyncedAt = await getLastSyncedAt(db,"categories");

    const res = await api.post("/finances/categories/sync/", {
      last_synced_at: lastSyncedAt,
    });

    await syncCategoriesFromApi(db, res.data.results);
    await saveLastSyncedAt(db, res.data.server_time,"categories");
  }

  const handleDefaultCategoriesSync = async() => {
    try {
      const res = await api.post("/finances/categories/sync/", {
        last_synced_at: null,
      });
      seedCategoriesIfEmpty(db,res?.data?.results)
    } catch (error) {
      console.log(error,"hello error")
    }
  }

  const bootstrap = async () => {
    if(userDetails){
      await handleDefaultCategoriesSync()
      await syncFromLocalToApi()
      await syncFromApiToLocal()
    }
    else{
      seedCategoriesIfEmpty(db)
    }
    
    syncManager.emit("categories_updated");
  };

  useSyncEngine({
    enabled:true,
    name: "categories",
    bootstrap,
  });

  return children;
}
