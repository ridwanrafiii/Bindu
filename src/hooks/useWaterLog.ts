import { useState, useEffect, useCallback } from 'react';
import { DayLog } from '../types';
import { loadDayLog, addWaterEntry, todayString } from '../services/storage';

interface UseWaterLogReturn {
  log: DayLog;
  totalMl: number;
  loading: boolean;
  logWater: (amountMl: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWaterLog(): UseWaterLogReturn {
  const today = todayString();
  const [log, setLog] = useState<DayLog>({ date: today, entries: [] });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const fresh = await loadDayLog(todayString());
    setLog(fresh);
  }, []);

  useEffect(() => {
    loadDayLog(today).then((l) => {
      setLog(l);
      setLoading(false);
    });
  }, []);

  const logWater = useCallback(async (amountMl: number) => {
    console.log('[useWaterLog] Logging water:', amountMl, 'ml for date:', todayString());
    const updated = await addWaterEntry(todayString(), amountMl);
    console.log('[useWaterLog] Updated log:', updated);
    setLog(updated);
  }, []);

  const totalMl = log.entries.reduce((sum, e) => sum + e, 0);

  return { log, totalMl, loading, logWater, refresh };
}
