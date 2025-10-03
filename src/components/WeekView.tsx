import React, { useState } from "react";
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface WeekViewProps {
  events: any[];
  onEventClick?: (event: any) => void;
}

export const WeekView = ({ events, onEventClick }: WeekViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const timeSlots = Array.from({ length: 24 }, (_, i) => i);

  const handlePreviousWeek = () => {
    setCurrentDate(addWeeks(currentDate, -1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter(event => {
      if (!event.event_date) return false;
      const eventDate = new Date(event.event_date);
      const isSameDate = isSameDay(eventDate, day);
      
      if (!isSameDate) return false;
      
      if (event.event_time) {
        const [eventHour] = event.event_time.split(':').map(Number);
        return eventHour === hour;
      }
      
      return hour === 0; // Events without time show at midnight
    });
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      confirmed: 'bg-green-500/20 border-green-500 text-green-700',
      planning: 'bg-yellow-500/20 border-yellow-500 text-yellow-700',
      ongoing: 'bg-blue-500/20 border-blue-500 text-blue-700',
      ended: 'bg-gray-500/20 border-gray-500 text-gray-700',
      draft: 'bg-gray-500/20 border-gray-500 text-gray-700',
    };
    return colors[status] || 'bg-gray-500/20 border-gray-500 text-gray-700';
  };

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

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </h3>
        </div>
      </div>

      {/* Week Grid */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-8 border-b bg-muted/50">
            <div className="p-2 text-xs font-medium text-center sticky left-0 bg-muted/50">Time</div>
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-l ${
                  isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                }`}
              >
                <div className="text-xs font-medium">{format(day, 'EEE')}</div>
                <div className={`text-sm ${
                  isSameDay(day, new Date()) ? 'font-bold text-primary' : ''
                }`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {timeSlots.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b min-h-[60px]">
                <div className="p-2 text-xs text-muted-foreground text-center border-r bg-muted/30 sticky left-0">
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
                {weekDays.map((day) => {
                  const dayEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`p-1 border-l min-h-[60px] ${
                        isSameDay(day, new Date()) ? 'bg-primary/5' : ''
                      }`}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={() => handleEventClick(event)}
                          className={`${getStatusColor(event.status)} border rounded p-1 mb-1 cursor-pointer hover:shadow-md transition-shadow text-xs`}
                        >
                          <div className="font-medium truncate flex items-center gap-1">
                            <span>{getRitualIcon(event.ritual_category)}</span>
                            <span className="truncate">{event.title}</span>
                          </div>
                          {event.event_time && (
                            <div className="text-[10px] opacity-80">
                              {event.event_time}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{getRitualIcon(selectedEvent?.ritual_category)}</span>
              {selectedEvent?.title}
            </DialogTitle>
            <DialogDescription>Event Details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-sm">
                  {selectedEvent?.event_date
                    ? format(new Date(selectedEvent.event_date), 'PPP')
                    : 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Time</p>
                <p className="text-sm">{selectedEvent?.event_time || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge variant={selectedEvent?.status === 'confirmed' ? 'default' : 'secondary'}>
                  {selectedEvent?.status || 'Draft'}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-sm capitalize">{selectedEvent?.event_type || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Venue</p>
              <p className="text-sm">{selectedEvent?.venue || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Expected Attendees</p>
              <p className="text-sm">{selectedEvent?.expected_attendees || 0} guests</p>
            </div>
            {selectedEvent?.description && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm">{selectedEvent.description}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
