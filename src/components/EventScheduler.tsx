import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Edit,
  Star,
  Flower,
  Music,
  Camera,
  Utensils
} from 'lucide-react';

const EventScheduler = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  const events = [
    {
      id: 1,
      name: 'Haldi Ceremony',
      date: '2024-12-10',
      time: '10:00 AM',
      venue: 'Family Home - Garden Area',
      attendees: 25,
      status: 'confirmed',
      color: 'bg-yellow-100 border-yellow-300',
      icon: Flower,
      description: 'Traditional turmeric ceremony with close family'
    },
    {
      id: 2,
      name: 'Mehendi Function',
      date: '2024-12-12',
      time: '3:00 PM',
      venue: 'Mandap Garden Venue',
      attendees: 50,
      status: 'planning',
      color: 'bg-green-100 border-green-300',
      icon: Star,
      description: 'Intricate henna designs and ladies sangeet'
    },
    {
      id: 3,
      name: 'Sangeet Night',
      date: '2024-12-13',
      time: '7:00 PM',
      venue: 'Hotel Ballroom',
      attendees: 150,
      status: 'confirmed',
      color: 'bg-purple-100 border-purple-300',
      icon: Music,
      description: 'Dance performances and musical celebration'
    },
    {
      id: 4,
      name: 'Wedding Ceremony',
      date: '2024-12-15',
      time: '11:30 AM',
      venue: 'Royal Marriage Hall',
      attendees: 200,
      status: 'confirmed',
      color: 'bg-pink-100 border-pink-300',
      icon: Star,
      description: 'Sacred wedding rituals and vows'
    },
    {
      id: 5,
      name: 'Reception',
      date: '2024-12-15',
      time: '7:00 PM',
      venue: 'Grand Banquet Hall',
      attendees: 300,
      status: 'confirmed',
      color: 'bg-blue-100 border-blue-300',
      icon: Utensils,
      description: 'Dinner and celebration with all guests'
    }
  ];

  const EventCard = ({ event }: { event: typeof events[0] }) => (
    <Card className={`wedding-card hover:shadow-lg transition-all duration-300 border-l-4 ${event.color}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <event.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{event.name}</CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-1">
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {event.time}
                </span>
                <span className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {event.attendees}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge 
            variant={event.status === 'confirmed' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {event.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{event.venue}</span>
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm">
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const AddEventDialog = () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="hero-button">
          <Plus className="h-4 w-4 mr-2" />
          Add Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
          <DialogDescription>
            Create a new event for your wedding celebration
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="eventName">Event Name</Label>
            <Input id="eventName" placeholder="e.g., Engagement Ceremony" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Date</Label>
              <Input id="eventDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventTime">Time</Label>
              <Input id="eventTime" type="time" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue">Venue</Label>
            <Input id="venue" placeholder="Event location" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendees">Expected Attendees</Label>
            <Input id="attendees" type="number" placeholder="Number of guests" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Event details and notes" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline">Cancel</Button>
          <Button className="hero-button">Create Event</Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ background: 'var(--gradient-soft)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            Event Scheduler
          </h1>
          <p className="text-muted-foreground text-lg">
            Plan and organize your wedding celebrations
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <AddEventDialog />
        </div>
      </div>

      {/* View Toggle */}
      <Card className="wedding-card">
        <CardContent className="pt-6">
          <Tabs value={view} onValueChange={(v) => setView(v as typeof view)} className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Events Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-serif font-semibold">Wedding Timeline</h2>
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Upcoming Events Summary */}
      <Card className="wedding-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>This Week's Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center space-x-3">
                  <event.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString()} • {event.time}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {new Date(event.date) > new Date() ? 
                    `${Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days` 
                    : 'Today'
                  }
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventScheduler;