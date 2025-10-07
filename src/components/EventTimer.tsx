import React, { useEffect, useState, useRef } from 'react';
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
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoCompletedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Start the clock timer
    timerIntervalRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Check for auto-completion on every render (not in useEffect)
  // This prevents infinite loops from dependency changes
  if (
    event.status === 'ongoing' && 
    event.started_at && 
    event.expected_duration &&
    !hasAutoCompletedRef.current.has(event.id)
  ) {
    const startTime = new Date(event.started_at).getTime();
    const elapsedMs = currentTime.getTime() - startTime;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);
    
    // If duration is reached, mark as completed and trigger update
    if (elapsedMinutes >= event.expected_duration) {
      // Mark this event as auto-completed to prevent multiple calls
      hasAutoCompletedRef.current.add(event.id);
      
      // Schedule the status update for the next tick to avoid state updates during render
      setTimeout(() => {
        onStatusUpdate(event.id, 'ended');
      }, 0);
    }
  }

  // Clean up completed events from the tracking set when status changes
  if (event.status !== 'ongoing' && hasAutoCompletedRef.current.has(event.id)) {
    // If event is no longer ongoing, we can remove it from our tracking
    // This allows the same event to be restarted later
    hasAutoCompletedRef.current.delete(event.id);
  }

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
          {event.expected_duration && (
            <span className="text-xs text-muted-foreground">
              / {formatDuration(event.expected_duration)}
            </span>
          )}
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
