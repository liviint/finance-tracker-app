import uuid from "react-native-uuid";
let newUuid = () => uuid.v4();

export const getAllShoppingLists = async (db) => {
    return await db.getAllAsync(`
        SELECT
            l.uuid,
            l.name,
            l.note,
            l.is_archived,
            l.created_at,
            l.updated_at,
        COUNT(i.uuid) AS item_count,
        SUM(CASE WHEN i.is_completed = 1 THEN 1 ELSE 0 END) AS completed_count
        FROM shopping_lists l
        LEFT JOIN shopping_items i
        ON i.list_uuid = l.uuid AND i.deleted_at IS NULL
        WHERE l.deleted_at IS NULL
        GROUP BY l.uuid
        ORDER BY l.created_at DESC;
    `);
};


// Get a single shopping list by its UUID, including item counts
export const getShoppingListByUuid = async (db, listUuid) => {
  return await db.getFirstAsync(`
    SELECT
      l.uuid,
      l.name,
      l.note,
      l.is_archived,
      l.created_at,
      l.updated_at,
      COUNT(i.uuid) AS item_count,
      SUM(CASE WHEN i.is_completed = 1 THEN 1 ELSE 0 END) AS completed_count
    FROM shopping_lists l
    LEFT JOIN shopping_items i
      ON i.list_uuid = l.uuid AND i.deleted_at IS NULL
    WHERE l.uuid = ? AND l.deleted_at IS NULL
    GROUP BY l.uuid
    LIMIT 1;
  `, [listUuid]);
};

// Insert or update a shopping list
export const upsertShoppingList = async (db, { uuid, name, note = "", is_archived = 0 }) => {
  const now = new Date().toISOString();
  const listUuid = uuid || newUuid();

  await db.runAsync(`
    INSERT INTO shopping_lists (
      uuid,
      name,
      note,
      is_archived,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      name = excluded.name,
      note = excluded.note,
      is_archived = excluded.is_archived,
      updated_at = excluded.updated_at
  `, [listUuid, name, note, is_archived, now, now]);

  return listUuid;
};

export const getShoppingItemsByListUuid = async (db, listUuid) => {
  return await db.getAllAsync(`
    SELECT
      *
    FROM shopping_items
    WHERE list_uuid = ? AND deleted_at IS NULL
    ORDER BY position ASC, created_at ASC;
  `, [listUuid]);
};


export const deleteShoppingList = async (db, listUuid) => {
  const now = new Date().toISOString();
  await db.runAsync(`
    UPDATE shopping_lists
    SET deleted_at = ?, updated_at = ?
    WHERE uuid = ?
  `, [now, now, listUuid]);
};

// ------------------ ITEMS ------------------

export const getItemsForList = async (db, listUuid) => {
  return await db.getAllAsync(`
    SELECT i.*
    FROM shopping_items i
    JOIN shopping_lists l ON l.id = i.list_id
    WHERE l.uuid = ? AND i.deleted_at IS NULL
    ORDER BY i.position ASC, i.created_at ASC
  `, [listUuid]);
};

export const upsertShoppingItem = async (db, {
  uuid,
  list_uuid,
  name,
  quantity = 1,
  estimated_price = 0,
  category_uuid = null,
  note = null,
  position = null,
  is_completed = 0
}) => {
  const now = new Date().toISOString();
  const itemUuid = uuid || newUuid();

  await db.runAsync(`
    INSERT INTO shopping_items (
      uuid,
      list_uuid,
      name,
      quantity,
      estimated_price,
      category_uuid,
      note,
      position,
      is_completed,
      created_at,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(uuid) DO UPDATE SET
      name = excluded.name,
      quantity = excluded.quantity,
      estimated_price = excluded.estimated_price,
      category_uuid = excluded.category_uuid,
      note = excluded.note,
      position = excluded.position,
      is_completed = excluded.is_completed,
      updated_at = excluded.updated_at
  `, [
    itemUuid, list_uuid, name, quantity, estimated_price,
    category_uuid, note, position, is_completed, now, now
  ]);

  return itemUuid;
};

export const deleteShoppingItem = async (db, itemUuid) => {
  const now = new Date().toISOString();
  await db.runAsync(`
    UPDATE shopping_items
    SET deleted_at = ?, updated_at = ?
    WHERE uuid = ?
  `, [now, now, itemUuid]);
};

// ------------------ STATS / UTILS ------------------

export const getShoppingListStats = async (db, listUuid) => {
  const list = await getShoppingListByUuid(db, listUuid);
  if (!list) return null;

  const items = await getItemsForList(db, listUuid);
  const totalEstimated = items.reduce((sum, i) => sum + (i.estimated_price || 0), 0);
  const completedCount = items.filter(i => i.is_completed).length;

  return {
    ...list,
    items,
    totalEstimated,
    completedCount,
    itemCount: items.length
  };
};

// Optional: get all lists with basic item stats
export const getAllListsWithStats = async (db) => {
  const lists = await getAllShoppingLists(db);
  return Promise.all(lists.map(async l => ({
    ...l,
    items: await getItemsForList(db, l.uuid)
  })));
};