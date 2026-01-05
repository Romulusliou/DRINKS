import { DrinkRecord, TAIPEI_BRANDS, IceLevel } from '../types';

const STORAGE_KEY = 'boba_buddy_2026_data';

export const getRecords = (): DrinkRecord[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load records", e);
    return [];
  }
};

export const saveRecord = (record: DrinkRecord): DrinkRecord[] => {
  const current = getRecords();
  const index = current.findIndex(r => r.id === record.id);
  let updated;
  
  if (index >= 0) {
    updated = [...current];
    updated[index] = record;
  } else {
    updated = [record, ...current];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteRecord = (id: string): DrinkRecord[] => {
  const current = getRecords();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const importData = (jsonData: string): number => {
  try {
    const imported = JSON.parse(jsonData);
    if (!Array.isArray(imported)) return -1;

    const current = getRecords();
    const currentIds = new Set(current.map(r => r.id));
    let addedCount = 0;

    const merged = [...current];

    imported.forEach((record: DrinkRecord) => {
      if (record.id && !currentIds.has(record.id)) {
        merged.push(record);
        currentIds.add(record.id);
        addedCount++;
      }
    });

    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return addedCount;
  } catch (e) {
    return -1;
  }
};

export const exportData = (): string => {
  return localStorage.getItem(STORAGE_KEY) || "[]";
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
