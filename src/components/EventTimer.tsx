import { useEffect, useState } from "react";
import { Clock, Play, Square, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface EventTimerProps {
  event: any;
  onStart: () => void;
  onEnd: () => void;
  onRestart: () => void;
  isUpdating: boolean;
}

export const EventTimer = ({ event, onStart, onEnd, onRestart, isUpdating }: EventTimerProps) => {
  const [currentDuration, setCurrentDuration] = useState(0);

  useEffect(() => {
    if (event.status === 'ongoing' && event.started_at) {
      const interval = setInterval(() => {
        const startTime = new Date(event.started_at).getTime();
        const now = new Date().getTime();
        const duration = Math.floor((now - startTime) / 1000); // seconds
        setCurrentDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    } else if (event.status === 'ended' && event.actual_duration) {
      setCurrentDuration(event.actual_duration * 60); // convert minutes to seconds
    }
  }, [event.status, event.started_at, event.actual_duration]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Event Duration</p>
            <p className="text-2xl font-bold text-primary">{formatDuration(currentDuration)}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {event.status === 'confirmed' && (
            <Button onClick={onStart} disabled={isUpdating} size="sm" className="gap-2">
              <Play className="h-4 w-4" />
              Start
            </Button>
          )}
          
          {event.status === 'ongoing' && (
            <Button onClick={onEnd} disabled={isUpdating} size="sm" variant="destructive" className="gap-2">
              <Square className="h-4 w-4" />
              End Event
            </Button>
          )}
          
          {event.status === 'ended' && (
            <Button onClick={onRestart} disabled={isUpdating} size="sm" variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restart
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};