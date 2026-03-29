import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Users, Plus, Edit, Trash2, Mail, Phone, Copy, Check, Search, UserPlus } from 'lucide-react';
import { useGuests, Guest } from '@/hooks/useGuests';
import { useEvents } from '@/hooks/useEvents';
import { useToast } from '@/hooks/use-toast';

const GuestManager = () => {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const { guests, addGuest, updateGuest, deleteGuest, isAdding, isUpdating, isDeleting, isLoading } = useGuests(selectedEventId === 'all' ? undefined : selectedEventId);
  const { toast } = useToast();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [guestForm, setGuestForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    relationship: '', dietary_restrictions: '', notes: '',
    plus_one: false, event_id: '',
  });

  const resetForm = () => {
    setGuestForm({
      first_name: '', last_name: '', email: '', phone: '',
      relationship: '', dietary_restrictions: '', notes: '',
      plus_one: false, event_id: '',
    });
  };

  const handleAddGuest = () => {
    if (!guestForm.first_name || !guestForm.last_name) return;
    addGuest({
      ...guestForm,
      event_id: guestForm.event_id || undefined,
    });
    resetForm();
    setShowAddDialog(false);
  };

  const handleEditGuest = () => {
    if (!selectedGuest || !guestForm.first_name || !guestForm.last_name) return;
    updateGuest({
      guestId: selectedGuest.id,
      guestData: {
        ...guestForm,
        event_id: guestForm.event_id || undefined,
      },
    });
    setShowEditDialog(false);
    setSelectedGuest(null);
  };

  const openEditDialog = (guest: Guest) => {
    setSelectedGuest(guest);
    setGuestForm({
      first_name: guest.first_name, last_name: guest.last_name,
      email: guest.email || '', phone: guest.phone || '',
      relationship: guest.relationship || '',
      dietary_restrictions: guest.dietary_restrictions || '',
      notes: guest.notes || '', plus_one: guest.plus_one || false,
      event_id: guest.event_id || '',
    });
    setShowEditDialog(true);
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast({ title: 'Invite link copied!' });
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const getRsvpBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      accepted: { variant: 'default', label: 'Accepted' },
      declined: { variant: 'destructive', label: 'Declined' },
      maybe: { variant: 'outline', label: 'Maybe' },
    };
    const config = map[status] || map.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredGuests = guests.filter(g =>
    `${g.first_name} ${g.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: guests.length,
    accepted: guests.filter(g => g.rsvp_status === 'accepted').length,
    declined: guests.filter(g => g.rsvp_status === 'declined').length,
    pending: guests.filter(g => g.rsvp_status === 'pending').length,
  };

  const GuestFormFields = () => (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>First Name *</Label>
          <Input value={guestForm.first_name} onChange={(e) => setGuestForm({ ...guestForm, first_name: e.target.value })} placeholder="First name" />
        </div>
        <div>
          <Label>Last Name *</Label>
          <Input value={guestForm.last_name} onChange={(e) => setGuestForm({ ...guestForm, last_name: e.target.value })} placeholder="Last name" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Email</Label>
          <Input type="email" value={guestForm.email} onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })} placeholder="Email address" />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={guestForm.phone} onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })} placeholder="Phone number" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Relationship</Label>
          <Select value={guestForm.relationship} onValueChange={(v) => setGuestForm({ ...guestForm, relationship: v })}>
            <SelectTrigger><SelectValue placeholder="Select relationship" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="family">Family</SelectItem>
              <SelectItem value="friend">Friend</SelectItem>
              <SelectItem value="colleague">Colleague</SelectItem>
              <SelectItem value="neighbor">Neighbor</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Event</Label>
          <Select value={guestForm.event_id} onValueChange={(v) => setGuestForm({ ...guestForm, event_id: v })}>
            <SelectTrigger><SelectValue placeholder="Select event" /></SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Dietary Restrictions</Label>
        <Input value={guestForm.dietary_restrictions} onChange={(e) => setGuestForm({ ...guestForm, dietary_restrictions: e.target.value })} placeholder="Any dietary restrictions" />
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea value={guestForm.notes} onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })} placeholder="Additional notes" />
      </div>
      <div className="flex items-center space-x-2">
        <Switch checked={guestForm.plus_one} onCheckedChange={(v) => setGuestForm({ ...guestForm, plus_one: v })} />
        <Label>Plus One</Label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ background: 'var(--gradient-soft)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold gradient-text">Guest Manager</h1>
          <p className="text-muted-foreground text-lg">Manage invitations and track RSVPs</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }} className="hero-button">
          <UserPlus className="h-4 w-4 mr-2" /> Add Guest
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Guests', value: stats.total, icon: Users, color: 'text-primary' },
          { label: 'Accepted', value: stats.accepted, icon: Check, color: 'text-green-600' },
          { label: 'Declined', value: stats.declined, icon: Trash2, color: 'text-destructive' },
          { label: 'Pending', value: stats.pending, icon: Mail, color: 'text-yellow-600' },
        ].map((stat, i) => (
          <Card key={i} className="wedding-card">
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={selectedEventId} onValueChange={setSelectedEventId}>
          <SelectTrigger className="w-full sm:w-[200px]"><SelectValue placeholder="Filter by event" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {events.map((event) => (
              <SelectItem key={event.id} value={event.id}>{event.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guest List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading guests...</p>
        </div>
      ) : filteredGuests.length === 0 ? (
        <Card className="wedding-card">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No guests yet</h3>
            <p className="text-muted-foreground mb-4">Start adding guests to your events</p>
            <Button onClick={() => { resetForm(); setShowAddDialog(true); }} variant="outline">
              <Plus className="h-4 w-4 mr-2" /> Add Your First Guest
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredGuests.map((guest) => (
            <Card key={guest.id} className="wedding-card hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{guest.first_name} {guest.last_name}</h3>
                      {getRsvpBadge(guest.rsvp_status)}
                      {guest.plus_one && <Badge variant="outline">+1</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {guest.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{guest.email}</span>}
                      {guest.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{guest.phone}</span>}
                      {guest.relationship && <Badge variant="secondary" className="text-xs capitalize">{guest.relationship}</Badge>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {guest.invite_token && (
                      <Button size="sm" variant="outline" onClick={() => copyInviteLink(guest.invite_token!)}>
                        {copiedToken === guest.invite_token ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openEditDialog(guest)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => { setSelectedGuest(guest); setShowDeleteDialog(true); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Guest Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Guest</DialogTitle>
            <DialogDescription>Add a new guest and generate an invite link.</DialogDescription>
          </DialogHeader>
          <GuestFormFields />
          <DialogFooter>
            <Button onClick={handleAddGuest} disabled={isAdding || !guestForm.first_name || !guestForm.last_name}>
              {isAdding ? 'Adding...' : 'Add Guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Guest Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Guest</DialogTitle>
            <DialogDescription>Update guest details.</DialogDescription>
          </DialogHeader>
          <GuestFormFields />
          <DialogFooter>
            <Button onClick={handleEditGuest} disabled={isUpdating || !guestForm.first_name || !guestForm.last_name}>
              {isUpdating ? 'Updating...' : 'Update Guest'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Guest</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedGuest?.first_name} {selectedGuest?.last_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (selectedGuest) { deleteGuest(selectedGuest.id); setShowDeleteDialog(false); setSelectedGuest(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GuestManager;
