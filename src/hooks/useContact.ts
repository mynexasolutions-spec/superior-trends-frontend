import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  submitContactForm,
  getContactMessagesAdmin,
  updateContactMessageStatus,
  deleteContactMessageAdmin,
} from '../lib/api';
import { useAdminAuth } from './useAdminAuth';

export const CONTACT_ADMIN_KEY = ['contact', 'admin'] as const;

export function useSubmitContact() {
  return useMutation({
    mutationFn: submitContactForm,
  });
}

export function useContactMessagesAdmin() {
  const { isAdmin, authReady } = useAdminAuth();
  return useQuery({
    queryKey: CONTACT_ADMIN_KEY,
    queryFn: getContactMessagesAdmin,
    enabled: authReady && isAdmin,
    refetchInterval: 30_000,
  });
}

export function useContactAdminMutations() {
  const qc = useQueryClient();

  const markRead = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'NEW' | 'READ' }) =>
      updateContactMessageStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACT_ADMIN_KEY }),
  });

  const remove = useMutation({
    mutationFn: deleteContactMessageAdmin,
    onSuccess: () => qc.invalidateQueries({ queryKey: CONTACT_ADMIN_KEY }),
  });

  return { markRead, remove };
}
