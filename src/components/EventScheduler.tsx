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

  const { events, createEvent, isCreating, isLoading, error } = useEvents();

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
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

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