import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Guest {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  relationship?: string;
  rsvp_status: string;
  dietary_restrictions?: string;
  plus_one?: boolean;
  invitation_sent?: boolean;
  notes?: string;
  event_id?: string;
  user_id: string;
  guest_user_id?: string;
  invite_token?: string;
  created_at: string;
  updated_at: string;
}

export const useGuests = (eventId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const guestsQuery = useQuery({
    queryKey: ['guests', eventId],
    queryFn: async () => {
      const action = eventId ? 'get-event-guests' : 'get-all-guests';
      const body = eventId ? { action, eventId } : { action };
      const { data, error } = await supabase.functions.invoke('guest-management', { body });
      if (error) throw error;
      return data.guests as Guest[];
    },
  });

  const addGuestMutation = useMutation({
    mutationFn: async (guestData: Partial<Guest>) => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'add-guest', guestData },
      });
      if (error) throw error;
      return data.guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest added successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error adding guest', description: error.message, variant: 'destructive' });
    },
  });

  const updateGuestMutation = useMutation({
    mutationFn: async ({ guestId, guestData }: { guestId: string; guestData: Partial<Guest> }) => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'update-guest', guestId, guestData },
      });
      if (error) throw error;
      return data.guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating guest', description: error.message, variant: 'destructive' });
    },
  });

  const deleteGuestMutation = useMutation({
    mutationFn: async (guestId: string) => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'delete-guest', guestId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      toast({ title: 'Guest removed' });
    },
    onError: (error: any) => {
      toast({ title: 'Error removing guest', description: error.message, variant: 'destructive' });
    },
  });

  return {
    guests: guestsQuery.data || [],
    isLoading: guestsQuery.isLoading,
    addGuest: addGuestMutation.mutate,
    updateGuest: updateGuestMutation.mutate,
    deleteGuest: deleteGuestMutation.mutate,
    isAdding: addGuestMutation.isPending,
    isUpdating: updateGuestMutation.isPending,
    isDeleting: deleteGuestMutation.isPending,
  };
};

export const useGuestDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ['my-invitations'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'get-my-invitations' },
      });
      if (error) throw error;
      return data as { guestRecords: Guest[]; events: any[] };
    },
  });

  const claimInviteMutation = useMutation({
    mutationFn: async (inviteToken: string) => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'claim-invite', inviteToken },
      });
      if (error) throw error;
      return data.guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast({ title: 'Invitation claimed successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error claiming invite', description: error.message, variant: 'destructive' });
    },
  });

  const updateRsvpMutation = useMutation({
    mutationFn: async ({ guestId, rsvpStatus, dietaryRestrictions }: { guestId: string; rsvpStatus: string; dietaryRestrictions?: string }) => {
      const { data, error } = await supabase.functions.invoke('guest-management', {
        body: { action: 'update-rsvp', guestId, rsvpStatus, dietaryRestrictions },
      });
      if (error) throw error;
      return data.guest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-invitations'] });
      toast({ title: 'RSVP updated!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating RSVP', description: error.message, variant: 'destructive' });
    },
  });

  return {
    guestRecords: invitationsQuery.data?.guestRecords || [],
    events: invitationsQuery.data?.events || [],
    isLoading: invitationsQuery.isLoading,
    claimInvite: claimInviteMutation.mutate,
    updateRsvp: updateRsvpMutation.mutate,
    isClaiming: claimInviteMutation.isPending,
    isUpdatingRsvp: updateRsvpMutation.isPending,
  };
};
