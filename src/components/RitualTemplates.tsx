import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { useEventTemplates } from '@/hooks/useEvents';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export const RitualTemplates = () => {
  const { templates, applyTimeline, isApplying } = useEventTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [weddingDate, setWeddingDate] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleApplyFullTimeline = () => {
    if (weddingDate) {
      applyTimeline({ baseDate: weddingDate });
      setIsDialogOpen(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pre_wedding: 'bg-purple-100 text-purple-800',
      wedding: 'bg-red-100 text-red-800',
      post_wedding: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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

  const preWeddingTemplates = templates.filter(t => t.category === 'pre_wedding');
  const weddingTemplates = templates.filter(t => t.category === 'wedding');
  const postWeddingTemplates = templates.filter(t => t.category === 'post_wedding');

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hindu Wedding Rituals</h2>
          <p className="text-muted-foreground">Choose from traditional ritual templates to create your perfect wedding timeline</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              Apply Full Timeline
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply Traditional Wedding Timeline</DialogTitle>
              <DialogDescription>
                Set your wedding date and we'll create a complete timeline with all traditional Hindu wedding rituals
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="wedding-date">Wedding Date</Label>
                <Input
                  id="wedding-date"
                  type="date"
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleApplyFullTimeline}
                disabled={!weddingDate || isApplying}
                className="w-full"
              >
                {isApplying ? 'Creating Timeline...' : 'Create Timeline'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pre-Wedding Rituals */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-purple-700">Pre-Wedding Rituals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {preWeddingTemplates.map((template) => (
            <RitualCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      {/* Wedding Day Rituals */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-red-700">Wedding Day Rituals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {weddingTemplates.map((template) => (
            <RitualCard key={template.id} template={template} />
          ))}
        </div>
      </div>

      {/* Post-Wedding Rituals */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-green-700">Post-Wedding Rituals</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {postWeddingTemplates.map((template) => (
            <RitualCard key={template.id} template={template} />
          ))}
        </div>
      </div>
    </div>
  );
};

const RitualCard = ({ template }: { template: any }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      pre_wedding: 'bg-purple-100 text-purple-800',
      wedding: 'bg-red-100 text-red-800',
      post_wedding: 'bg-green-100 text-green-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-2xl">{getRitualIcon(template.ritual_category)}</div>
          <Badge className={getCategoryColor(template.category)}>
            {template.category.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="text-lg group-hover:text-primary transition-colors">
          {template.name}
        </CardTitle>
        <CardDescription className="text-sm">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{template.typical_duration ? `${template.typical_duration} mins` : 'Variable duration'}</span>
        </div>
        
        {template.requirements && template.requirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Requirements:</h4>
            <div className="flex flex-wrap gap-1">
              {template.requirements.slice(0, 3).map((req: string, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {req}
                </Badge>
              ))}
              {template.requirements.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{template.requirements.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};