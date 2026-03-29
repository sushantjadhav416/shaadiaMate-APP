import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Heart, CheckCircle, XCircle, HelpCircle, Ticket } from 'lucide-react';
import { useGuestDashboard } from '@/hooks/useGuests';
import { format } from 'date-fns';

interface GuestDashboardProps {
  userProfile?: any;
  onClaimInvite?: () => void;
}

const GuestDashboard = ({ userProfile }: GuestDashboardProps) => {
  const { guestRecords, events, isLoading, updateRsvp, isUpdatingRsvp, claimInvite, isClaiming } = useGuestDashboard();
  const [showRsvpDialog, setShowRsvpDialog] = useState(false);
  const [showClaimDialog, setShowClaimDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [rsvpStatus, setRsvpStatus] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [inviteToken, setInviteToken] = useState('');

  const handleUpdateRsvp = () => {
    if (!selectedRecord) return;
    updateRsvp({ guestId: selectedRecord.id, rsvpStatus, dietaryRestrictions });
    setShowRsvpDialog(false);
  };

  const handleClaimInvite = () => {
    if (!inviteToken.trim()) return;
    // Extract token from full URL or just use token directly
    const token = inviteToken.includes('invite=') 
      ? new URL(inviteToken).searchParams.get('invite') || inviteToken 
      : inviteToken;
    claimInvite(token);
    setInviteToken('');
    setShowClaimDialog(false);
  };

  const openRsvpDialog = (record: any) => {
    setSelectedRecord(record);
    setRsvpStatus(record.rsvp_status || 'pending');
    setDietaryRestrictions(record.dietary_restrictions || '');
    setShowRsvpDialog(true);
  };

  const getEventForGuest = (record: any) => events.find(e => e.id === record.event_id);

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'declined': return <XCircle className="h-5 w-5 text-destructive" />;
      default: return <HelpCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getRitualIcon = (category: string) => {
    const icons: Record<string, string> = {
      engagement: '💍', haldi: '💛', mehendi: '🌿', sangeet: '🎵',
      tilaka: '🕉️', baraat: '🐎', jaimala: '🌺', saat_phere: '🔥',
      sindoor: '❤️', bidaai: '👋', griha_pravesh: '🏠', reception: '🎉',
    };
    return icons[category] || '✨';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-soft)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your invitations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ background: 'var(--gradient-soft)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold gradient-text">
            Welcome, {userProfile?.display_name || userProfile?.first_name || 'Guest'}! 🎉
          </h1>
          <p className="text-muted-foreground text-lg">Your event invitations and details</p>
        </div>
        <Button onClick={() => setShowClaimDialog(true)} variant="outline">
          <Ticket className="h-4 w-4 mr-2" /> Claim Invitation
        </Button>
      </div>

      {/* No Invitations */}
      {guestRecords.length === 0 ? (
        <Card className="wedding-card">
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-serif font-bold mb-2">No Invitations Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't been linked to any events yet. Use an invite link or claim an invitation below.
            </p>
            <Button onClick={() => setShowClaimDialog(true)} className="hero-button">
              <Ticket className="h-4 w-4 mr-2" /> Claim Invitation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Event Timeline */}
          <div>
            <h2 className="text-2xl font-serif font-bold mb-4 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" /> Event Timeline
            </h2>
            <div className="space-y-4">
              {events.map((event) => {
                const guestRecord = guestRecords.find(g => g.event_id === event.id);
                return (
                  <Card key={event.id} className="wedding-card hover:shadow-md transition-shadow overflow-hidden">
                    <div className="flex">
                      {/* Date sidebar */}
                      <div className="bg-primary/10 p-4 flex flex-col items-center justify-center min-w-[100px]">
                        <span className="text-3xl">{getRitualIcon(event.ritual_category)}</span>
                        {event.event_date && (
                          <>
                            <p className="text-sm font-bold mt-2">
                              {format(new Date(event.event_date), 'MMM dd')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(event.event_date), 'yyyy')}
                            </p>
                          </>
                        )}
                      </div>
                      {/* Event details */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                              {event.event_time && (
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.event_time}</span>
                              )}
                              {event.venue && (
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}</span>
                              )}
                              {event.expected_attendees && (
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.expected_attendees} guests</span>
                              )}
                            </div>
                          </div>
                          <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'} className="capitalize">
                            {event.status}
                          </Badge>
                        </div>

                        {/* RSVP Section */}
                        {guestRecord && (
                          <div className="mt-4 pt-3 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getRsvpIcon(guestRecord.rsvp_status)}
                              <span className="text-sm font-medium capitalize">
                                RSVP: {guestRecord.rsvp_status}
                              </span>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => openRsvpDialog(guestRecord)}>
                              Update RSVP
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* RSVP Dialog */}
      <Dialog open={showRsvpDialog} onOpenChange={setShowRsvpDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Your RSVP</DialogTitle>
            <DialogDescription>Let the host know if you'll be attending.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Your Response</Label>
              <Select value={rsvpStatus} onValueChange={setRsvpStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="accepted">✅ Accept - I'll be there!</SelectItem>
                  <SelectItem value="declined">❌ Decline - Can't make it</SelectItem>
                  <SelectItem value="maybe">🤔 Maybe - Not sure yet</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Dietary Restrictions</Label>
              <Textarea value={dietaryRestrictions} onChange={(e) => setDietaryRestrictions(e.target.value)} placeholder="Any dietary requirements..." />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateRsvp} disabled={isUpdatingRsvp}>
              {isUpdatingRsvp ? 'Updating...' : 'Submit RSVP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Claim Invite Dialog */}
      <Dialog open={showClaimDialog} onOpenChange={setShowClaimDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Claim Your Invitation</DialogTitle>
            <DialogDescription>Paste the invite link or token you received.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Invite Link or Token</Label>
            <Input value={inviteToken} onChange={(e) => setInviteToken(e.target.value)} placeholder="Paste your invite link or token..." />
          </div>
          <DialogFooter>
            <Button onClick={handleClaimInvite} disabled={isClaiming || !inviteToken.trim()}>
              {isClaiming ? 'Claiming...' : 'Claim Invitation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GuestDashboard;
