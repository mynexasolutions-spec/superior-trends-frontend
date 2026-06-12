import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettings, updateSettings } from '../lib/api';
import type { SystemSettings } from '../lib/api';

export const SETTINGS_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: getSettings,
    staleTime: 5 * 60_000, // settings cached for 5 minutes
  });
}

export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<SystemSettings>) => updateSettings(settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SETTINGS_KEY });
      qc.invalidateQueries({ queryKey: ['cart'] }); // Force dynamic cart totals recalculation
    },
  });
}
