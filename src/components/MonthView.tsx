import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  addMonths,
  subMonths,
  isToday
} from "date-fns";

interface Event {
  id: string;
  title: string;
  event_date: string;
  event_time?: string;
  venue?: string;
  status: string;
  ritual_category?: string;
  expected_attendees?: number;
  description?: string;
}

interface MonthViewProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

export const MonthView = ({ events, onEventClick }: MonthViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      event.event_date && isSameDay(new Date(event.event_date), day)
    );
  };

  const getRitualIcon = (category?: string) => {
    if (!category) return '✨';
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
      confirmed: 'bg-success/10 border-success/30 text-success',
      planning: 'bg-warning/10 border-warning/30 text-warning',
      ongoing: 'bg-primary/10 border-primary/30 text-primary',
      completed: 'bg-muted border-border text-muted-foreground',
      cancelled: 'bg-destructive/10 border-destructive/30 text-destructive',
    };
    return colors[status] || 'bg-muted border-border text-muted-foreground';
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <Card className="wedding-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={previousMonth}
              className="hover:bg-primary/10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-serif font-semibold">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToToday}
                className="text-xs hover:bg-primary/10"
              >
                Today
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextMonth}
              className="hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="wedding-card">
        <CardContent className="p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              const dayEvents = getEventsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border rounded-lg p-2 transition-all ${
                    isCurrentMonth 
                      ? 'bg-card hover:bg-accent/5 border-border' 
                      : 'bg-muted/30 border-muted text-muted-foreground'
                  } ${isDayToday ? 'ring-2 ring-primary shadow-elegant' : ''}`}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1">
                    <span 
                      className={`text-sm font-medium ${
                        isDayToday 
                          ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold' 
                          : ''
                      }`}
                    >
                      {format(day, 'd')}
                    </span>
                    {dayEvents.length > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs h-5 px-1.5"
                      >
                        {dayEvents.length}
                      </Badge>
                    )}
                  </div>

                  {/* Events for the day */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <button
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`w-full text-left p-1.5 rounded text-xs border transition-all hover:scale-105 ${getStatusColor(event.status)}`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="text-xs">{getRitualIcon(event.ritual_category)}</span>
                          <span className="font-medium truncate flex-1">
                            {event.title}
                          </span>
                        </div>
                        {event.event_time && (
                          <div className="flex items-center gap-1 opacity-75">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="text-[10px]">{event.event_time}</span>
                          </div>
                        )}
                      </button>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-center text-muted-foreground pt-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="wedding-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status Legend:</span>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge className="bg-warning/10 border-warning/30 text-warning border">Planning</Badge>
              <Badge className="bg-success/10 border-success/30 text-success border">Confirmed</Badge>
              <Badge className="bg-primary/10 border-primary/30 text-primary border">Ongoing</Badge>
              <Badge className="bg-muted border-border text-muted-foreground border">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
