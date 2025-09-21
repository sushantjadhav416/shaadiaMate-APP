import React, { useState } from "react";
import { Calendar, Users, MapPin, Clock, Plus, Edit, Eye, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useEvents } from "@/hooks/useEvents";
import { RitualTemplates } from "./RitualTemplates";

const EventScheduler = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState("timeline");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: '',
    event_type: 'wedding',
    ritual_category: '',
    expected_attendees: '',
  });
  const [editEvent, setEditEvent] = useState({
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    venue: '',
    event_type: 'wedding',
    ritual_category: '',
    expected_attendees: '',
  });

  const { events, createEvent, updateEvent, isCreating, isUpdating, isLoading, error } = useEvents();

  console.log('EventScheduler - Events:', events);
  console.log('EventScheduler - IsLoading:', isLoading);
  console.log('EventScheduler - Error:', error);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.event_date) {
      return;
    }
    
    createEvent({
      ...newEvent,
      expected_attendees: newEvent.expected_attendees ? parseInt(newEvent.expected_attendees) : undefined,
    });
    setNewEvent({
      title: '',
      description: '',
      event_date: '',
      event_time: '',
      venue: '',
      event_type: 'wedding',
      ritual_category: '',
      expected_attendees: '',
    });
    setShowAddDialog(false);
  };

  const handleEditEvent = () => {
    if (!editEvent.title || !editEvent.event_date || !selectedEvent) {
      return;
    }
    
    updateEvent({
      eventId: selectedEvent.id,
      eventData: {
        ...editEvent,
        expected_attendees: editEvent.expected_attendees ? parseInt(editEvent.expected_attendees) : undefined,
      }
    });
    setShowEditDialog(false);
    setSelectedEvent(null);
  };

  const openEditDialog = (event: any) => {
    setSelectedEvent(event);
    setEditEvent({
      title: event.title || '',
      description: event.description || '',
      event_date: event.event_date ? new Date(event.event_date).toISOString().split('T')[0] : '',
      event_time: event.event_time || '',
      venue: event.venue || '',
      event_type: event.event_type || 'wedding',
      ritual_category: event.ritual_category || '',
      expected_attendees: event.expected_attendees?.toString() || '',
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (event: any) => {
    setSelectedEvent(event);
    setShowViewDialog(true);
  };

  const handleStatusUpdate = (eventId: string, newStatus: string) => {
    updateEvent({
      eventId,
      eventData: { status: newStatus }
    });
  };

  const EventCard = ({ event }: { event: any }) => {
    const getRitualIcon = (category: string) => {
      const icons: { [key: string]: string } = {
        engagement: '💍',
        haldi: '💛',
        mehendi: '🌿',
        sangeet: '🎵',
        tilaka: '🕉️',
        baraat: '🐎',
        jaimala: '🌺',
        saat_phere: '🔥',
        sindoor: '❤️',
        bidaai: '👋',
        griha_pravesh: '🏠',
        reception: '🎉',
      };
      return icons[category] || '✨';
    };

    const getStatusColor = (status: string) => {
      const colors: { [key: string]: string } = {
        confirmed: 'bg-green-100 border-green-300 text-green-800',
        planning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        ongoing: 'bg-blue-100 border-blue-300 text-blue-800',
        ended: 'bg-gray-100 border-gray-300 text-gray-800',
        draft: 'bg-gray-100 border-gray-300 text-gray-800',
      };
      return colors[status] || 'bg-gray-100 border-gray-300 text-gray-800';
    };

    return (
      <Card className={`${getStatusColor(event.status)} border-2 hover:shadow-md transition-shadow`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getRitualIcon(event.ritual_category)}</span>
              <div>
                <CardTitle className="text-lg">{event.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{event.event_time || 'Time TBD'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{event.expected_attendees || 0} guests</span>
                  </div>
                </div>
              </div>
            </div>
            <Badge variant={event.status === "confirmed" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="h-3 w-3" />
              <span>{event.venue || 'Venue TBD'}</span>
            </div>
            <p className="text-sm text-muted-foreground">{event.description}</p>
            <div className="flex gap-2 mt-3">
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(event)}>
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1" onClick={() => openViewDialog(event)}>
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
            {/* Status Update Buttons */}
            <div className="flex gap-1 mt-2">
              {event.status === 'planning' && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1 text-xs" 
                  onClick={() => handleStatusUpdate(event.id, 'confirmed')}
                  disabled={isUpdating}
                >
                  Confirm
                </Button>
              )}
              {event.status === 'confirmed' && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1 text-xs" 
                  onClick={() => handleStatusUpdate(event.id, 'ongoing')}
                  disabled={isUpdating}
                >
                  Start Event
                </Button>
              )}
              {event.status === 'ongoing' && (
                <Button 
                  size="sm" 
                  variant="default" 
                  className="flex-1 text-xs" 
                  onClick={() => handleStatusUpdate(event.id, 'ended')}
                  disabled={isUpdating}
                >
                  End Event
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Dialog for editing events
  const EditEventDialog = () => (
    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Update the details for this wedding event.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-event-name" className="text-right">
              Event
            </Label>
            <Input 
              id="edit-event-name" 
              placeholder="Event name" 
              className="col-span-3"
              value={editEvent.title}
              onChange={(e) => setEditEvent({ ...editEvent, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-event-type" className="text-right">
              Type
            </Label>
            <Select 
              value={editEvent.event_type} 
              onValueChange={(value) => setEditEvent({ ...editEvent, event_type: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pre-wedding">Pre-Wedding</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="post-wedding">Post-Wedding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-ritual-category" className="text-right">
              Ritual
            </Label>
            <Select 
              value={editEvent.ritual_category} 
              onValueChange={(value) => setEditEvent({ ...editEvent, ritual_category: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select ritual" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engagement">Engagement</SelectItem>
                <SelectItem value="haldi">Haldi</SelectItem>
                <SelectItem value="mehendi">Mehendi</SelectItem>
                <SelectItem value="sangeet">Sangeet</SelectItem>
                <SelectItem value="tilaka">Tilaka</SelectItem>
                <SelectItem value="baraat">Baraat</SelectItem>
                <SelectItem value="jaimala">Jaimala</SelectItem>
                <SelectItem value="saat_phere">Saat Phere</SelectItem>
                <SelectItem value="sindoor">Sindoor</SelectItem>
                <SelectItem value="bidaai">Bidaai</SelectItem>
                <SelectItem value="griha_pravesh">Griha Pravesh</SelectItem>
                <SelectItem value="reception">Reception</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-event-date" className="text-right">
              Date
            </Label>
            <Input 
              id="edit-event-date" 
              type="date" 
              className="col-span-3"
              value={editEvent.event_date}
              onChange={(e) => setEditEvent({ ...editEvent, event_date: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-event-time" className="text-right">
              Time
            </Label>
            <Input 
              id="edit-event-time" 
              type="time" 
              className="col-span-3"
              value={editEvent.event_time}
              onChange={(e) => setEditEvent({ ...editEvent, event_time: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-venue" className="text-right">
              Venue
            </Label>
            <Input 
              id="edit-venue" 
              placeholder="Venue location" 
              className="col-span-3"
              value={editEvent.venue}
              onChange={(e) => setEditEvent({ ...editEvent, venue: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-attendees" className="text-right">
              Guests
            </Label>
            <Input 
              id="edit-attendees" 
              type="number" 
              placeholder="Expected attendees" 
              className="col-span-3"
              value={editEvent.expected_attendees}
              onChange={(e) => setEditEvent({ ...editEvent, expected_attendees: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-description" className="text-right">
              Details
            </Label>
            <Textarea 
              id="edit-description" 
              placeholder="Event description" 
              className="col-span-3"
              value={editEvent.description}
              onChange={(e) => setEditEvent({ ...editEvent, description: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleEditEvent}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            disabled={isUpdating || !editEvent.title || !editEvent.event_date}
          >
            {isUpdating ? 'Updating...' : 'Update Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Dialog for viewing event details
  const ViewEventDialog = () => (
    <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg">
              {selectedEvent?.ritual_category ? 
                (() => {
                  const icons: { [key: string]: string } = {
                    engagement: '💍',
                    haldi: '💛',
                    mehendi: '🌿',
                    sangeet: '🎵',
                    tilaka: '🕉️',
                    baraat: '🐎',
                    jaimala: '🌺',
                    saat_phere: '🔥',
                    sindoor: '❤️',
                    bidaai: '👋',
                    griha_pravesh: '🏠',
                    reception: '🎉',
                  };
                  return icons[selectedEvent.ritual_category] || '✨';
                })() : '✨'
              }
            </span>
            {selectedEvent?.title}
          </DialogTitle>
          <DialogDescription>
            Event details and information
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Type</Label>
              <p className="text-sm capitalize">{selectedEvent?.event_type || 'Not specified'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                <Badge variant={selectedEvent?.status === "confirmed" ? "default" : "secondary"} className="w-fit">
                  {selectedEvent?.status || 'Draft'}
                </Badge>
                {/* Status change buttons in view dialog */}
                {selectedEvent?.status === 'planning' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      handleStatusUpdate(selectedEvent.id, 'confirmed');
                      setShowViewDialog(false);
                    }}
                    disabled={isUpdating}
                  >
                    Confirm
                  </Button>
                )}
                {selectedEvent?.status === 'confirmed' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      handleStatusUpdate(selectedEvent.id, 'ongoing');
                      setShowViewDialog(false);
                    }}
                    disabled={isUpdating}
                  >
                    Start
                  </Button>
                )}
                {selectedEvent?.status === 'ongoing' && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => {
                      handleStatusUpdate(selectedEvent.id, 'ended');
                      setShowViewDialog(false);
                    }}
                    disabled={isUpdating}
                  >
                    End
                  </Button>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Guests</Label>
              <p className="text-sm">{selectedEvent?.expected_attendees || 0} attendees</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>
                {selectedEvent?.event_date ? 
                  format(new Date(selectedEvent.event_date), 'PPP') : 
                  'Date not set'
                }
              </span>
              {selectedEvent?.event_time && (
                <>
                  <Clock className="h-4 w-4 ml-2" />
                  <span>{selectedEvent.event_time}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Venue</Label>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{selectedEvent?.venue || 'Venue not specified'}</span>
            </div>
          </div>

          {selectedEvent?.description && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Description</Label>
              <p className="text-sm">{selectedEvent.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Ritual Category</Label>
            <p className="text-sm capitalize">{selectedEvent?.ritual_category || 'Not specified'}</p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setShowViewDialog(false);
              openEditDialog(selectedEvent);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Dialog for adding new events
  const AddEventDialog = () => (
    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
      <DialogTrigger asChild>
        <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Wedding Event</DialogTitle>
          <DialogDescription>
            Create a new event for your wedding celebration timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          handleCreateEvent();
        }}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-name" className="text-right">
                Event
              </Label>
              <Input 
                id="event-name" 
                placeholder="Event name" 
                className="col-span-3"
                value={newEvent.title}
                onChange={(e) => {
                  console.log('Title changing to:', e.target.value);
                  setNewEvent({ ...newEvent, title: e.target.value });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-type" className="text-right">
                Type
              </Label>
              <Select 
                value={newEvent.event_type} 
                onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-wedding">Pre-Wedding</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="post-wedding">Post-Wedding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ritual-category" className="text-right">
                Ritual
              </Label>
              <Select 
                value={newEvent.ritual_category} 
                onValueChange={(value) => setNewEvent({ ...newEvent, ritual_category: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select ritual" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="haldi">Haldi</SelectItem>
                  <SelectItem value="mehendi">Mehendi</SelectItem>
                  <SelectItem value="sangeet">Sangeet</SelectItem>
                  <SelectItem value="tilaka">Tilaka</SelectItem>
                  <SelectItem value="baraat">Baraat</SelectItem>
                  <SelectItem value="jaimala">Jaimala</SelectItem>
                  <SelectItem value="saat_phere">Saat Phere</SelectItem>
                  <SelectItem value="sindoor">Sindoor</SelectItem>
                  <SelectItem value="bidaai">Bidaai</SelectItem>
                  <SelectItem value="griha_pravesh">Griha Pravesh</SelectItem>
                  <SelectItem value="reception">Reception</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date
              </Label>
              <Input 
                id="event-date" 
                type="date" 
                className="col-span-3"
                value={newEvent.event_date}
                onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Time
              </Label>
              <Input 
                id="event-time" 
                type="time" 
                className="col-span-3"
                value={newEvent.event_time}
                onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="venue" className="text-right">
                Venue
              </Label>
              <Input 
                id="venue" 
                placeholder="Venue location" 
                className="col-span-3"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendees" className="text-right">
                Guests
              </Label>
              <Input 
                id="attendees" 
                type="number" 
                placeholder="Expected attendees" 
                className="col-span-3"
                value={newEvent.expected_attendees}
                onChange={(e) => setNewEvent({ ...newEvent, expected_attendees: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Details
              </Label>
              <Textarea 
                id="description" 
                placeholder="Event description" 
                className="col-span-3"
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              disabled={isCreating || !newEvent.title || !newEvent.event_date}
            >
              {isCreating ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-destructive">Error loading events</h3>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Event & Ritual Scheduler</h1>
          <p className="text-muted-foreground">Plan your perfect Hindu wedding timeline with traditional rituals</p>
        </div>
        <AddEventDialog />
        <EditEventDialog />
        <ViewEventDialog />
      </div>

      {/* Navigation Tabs */}
      <div className="space-y-6">
        <Tabs value={view} onValueChange={setView} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="templates">
              <Sparkles className="h-4 w-4 mr-1" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            {/* Wedding Timeline */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Wedding Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
                    <p className="text-muted-foreground mb-4">Start building your wedding timeline by adding your first event or applying a template.</p>
                    <div className="space-x-2">
                      <Button onClick={() => setShowAddDialog(true)}>Add First Event</Button>
                      <Button variant="outline" onClick={() => setView("templates")}>Browse Templates</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events Summary */}
            {events.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Upcoming Events Summary</h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-primary">{events.length}</p>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {events.filter(e => e.status === 'confirmed').length}
                      </p>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-yellow-600">
                        {events.filter(e => e.status === 'planning').length}
                      </p>
                      <p className="text-sm text-muted-foreground">In Planning</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates">
            <RitualTemplates />
          </TabsContent>

          <TabsContent value="month" className="space-y-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <p>Month view coming soon</p>
            </div>
          </TabsContent>

          <TabsContent value="week" className="space-y-6">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2" />
              <p>Week view coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EventScheduler;