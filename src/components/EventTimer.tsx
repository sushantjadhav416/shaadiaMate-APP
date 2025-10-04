import React, { useEffect, useState } from 'react';
import { Clock, Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventTimerProps {
  event: any;
  onStatusUpdate: (eventId: string, status: string, extraData?: any) => void;
  isUpdating: boolean;
}

export const EventTimer: React.FC<EventTimerProps> = ({ event, onStatusUpdate, isUpdating }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getElapsedTime = () => {
    if (!event.started_at) return '0h 0m';
    
    const startTime = new Date(event.started_at).getTime();
    const endTime = event.ended_at ? new Date(event.ended_at).getTime() : currentTime.getTime();
    const elapsed = Math.floor((endTime - startTime) / 60000); // in minutes
    
    return formatDuration(elapsed);
  };

  const handleStart = () => {
    onStatusUpdate(event.id, 'ongoing');
  };

  const handleEnd = () => {
    onStatusUpdate(event.id, 'ended');
  };

  const handleRestart = () => {
    onStatusUpdate(event.id, 'confirmed', { restart: true });
  };

  if (event.status === 'planning' || event.status === 'draft') {
    return null;
  }

  return (
    <div className="border-t pt-3 mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span className="font-medium">Duration:</span>
          <Badge variant="outline">
            {event.status === 'ended' && event.actual_duration 
              ? formatDuration(event.actual_duration)
              : getElapsedTime()
            }
          </Badge>
        </div>
      </div>

      <div className="flex gap-2">
        {event.status === 'confirmed' && (
          <Button 
            size="sm" 
            variant="default" 
            className="flex-1"
            onClick={handleStart}
            disabled={isUpdating}
          >
            <Play className="h-3 w-3 mr-1" />
            Start Event
          </Button>
        )}
        
        {event.status === 'ongoing' && (
          <Button 
            size="sm" 
            variant="destructive" 
            className="flex-1"
            onClick={handleEnd}
            disabled={isUpdating}
          >
            <Square className="h-3 w-3 mr-1" />
            End Event
          </Button>
        )}
        
        {event.status === 'ended' && (
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={handleRestart}
            disabled={isUpdating}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Restart Event
          </Button>
        )}
      </div>
    </div>
  );
};
