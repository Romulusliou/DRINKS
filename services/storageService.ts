
import { createClient } from '@supabase/supabase-js';
import { DrinkRecord } from '../types';

// Supabase Configuration
// 注意：在正式專案中，這些應該放在環境變數 (.env)
const SUPABASE_URL = 'https://kjqdxxdgzxtnhbtcbkvj.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zXod2_DmVE3nZekLruW3oQ_sZgiDvBe'; // 這裡填入你的 Anon Key

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Table Name
const TABLE_NAME = 'drinks';

// Mapping function: DB (snake_case) -> App (camelCase)
const mapFromDb = (row: any): DrinkRecord => ({
  id: row.id,
  drinkerName: row.drinker_name,
  brand: row.brand,
  drinkName: row.drink_name,
  sugarLevel: row.sugar_level,
  sugarValue: row.sugar_value,
  iceLevel: row.ice_level,
  toppings: row.toppings,
  review: row.review,
  price: row.price,
  rating: row.rating,
  date: row.date,
  timestamp: row.timestamp
});

// Mapping function: App (camelCase) -> DB (snake_case)
const mapToDb = (record: DrinkRecord, groupId: string) => ({
  id: record.id,
  drinker_name: record.drinkerName,
  brand: record.brand,
  drink_name: record.drinkName,
  sugar_level: record.sugarLevel,
  sugar_value: record.sugarValue,
  ice_level: record.iceLevel,
  toppings: record.toppings,
  review: record.review,
  price: record.price,
  rating: record.rating,
  date: record.date,
  timestamp: record.timestamp,
  group_id: groupId
});

export const fetchRecords = async (groupId: string): Promise<DrinkRecord[]> => {
  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('group_id', groupId)
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return (data || []).map(mapFromDb);
};

export const saveRecord = async (record: DrinkRecord, groupId: string): Promise<void> => {
  const payload = mapToDb(record, groupId);
  
  // 使用 upsert，如果 ID 存在則更新，不存在則新增
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(payload);

  if (error) {
    console.error('Error saving record:', error);
    throw error;
  }
};

export const deleteRecord = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting record:', error);
    throw error;
  }
};

// Real-time Subscription
export const subscribeToGroup = (groupId: string, onUpdate: () => void) => {
  return supabase
    .channel(`group-${groupId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: TABLE_NAME,
        filter: `group_id=eq.${groupId}`
      },
      (payload) => {
        console.log('Change received!', payload);
        onUpdate();
      }
    )
    .subscribe();
};

// Backup functions (Exports JSON still useful for backup)
export const exportData = async (groupId: string): Promise<string> => {
  const records = await fetchRecords(groupId);
  return JSON.stringify(records);
};
