import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Plus, 
  DollarSign, 
  Users, 
  CheckSquare, 
  Heart,
  Clock,
  TrendingUp,
  Star,
  Bell
} from 'lucide-react';

const Dashboard = () => {
  // Mock data
  const weddingDate = new Date('2024-12-15');
  const today = new Date();
  const daysUntilWedding = Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  
  const stats = [
    { label: 'Budget Remaining', value: '₹2,45,000', total: '₹5,00,000', percentage: 49, icon: DollarSign, color: 'success' },
    { label: 'Total Events', value: '8', subtitle: '5 completed', icon: Calendar, color: 'primary' },
    { label: 'Pending Tasks', value: '12', subtitle: '3 urgent', icon: CheckSquare, color: 'warning' },
    { label: 'Guest RSVPs', value: '156/200', percentage: 78, icon: Users, color: 'accent' },
  ];

  const recentEvents = [
    { name: 'Haldi Ceremony', date: '2024-12-10', status: 'confirmed', venue: 'Family Home' },
    { name: 'Mehendi Function', date: '2024-12-12', status: 'planning', venue: 'Garden Venue' },
    { name: 'Sangeet Night', date: '2024-12-13', status: 'confirmed', venue: 'Hotel Ballroom' },
    { name: 'Wedding Ceremony', date: '2024-12-15', status: 'confirmed', venue: 'Marriage Hall' },
  ];

  const quickActions = [
    { label: 'Add Event', icon: Calendar, variant: 'hero' as const },
    { label: 'New Task', icon: CheckSquare, variant: 'accent' as const },
    { label: 'Add Expense', icon: DollarSign, variant: 'outline' as const },
  ];

  return (
    <div className="min-h-screen p-6 space-y-8" style={{ background: 'var(--gradient-soft)' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold gradient-text mb-2">
            Welcome back, Priya! 
          </h1>
          <p className="text-muted-foreground text-lg">
            Let's make your special day perfect ✨
          </p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            {daysUntilWedding} days to go!
          </Badge>
        </div>
      </div>

      {/* Countdown Card */}
      <Card className="wedding-card animate-glow relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: 'var(--gradient-primary)' }}></div>
        <CardContent className="p-8 text-center relative">
          <Heart className="h-16 w-16 mx-auto mb-4 text-primary animate-float" fill="currentColor" />
          <h2 className="text-6xl font-serif font-bold mb-2 gradient-text">
            {daysUntilWedding}
          </h2>
          <p className="text-2xl font-medium text-muted-foreground mb-2">
            Days Until Forever
          </p>
          <p className="text-lg text-muted-foreground">
            December 15, 2024 • 11:30 AM
          </p>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="wedding-card hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-5 w-5 text-${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground mb-2">{stat.subtitle}</p>
              )}
              {stat.percentage && (
                <div className="space-y-1">
                  <Progress value={stat.percentage} className="h-2" />
                  <p className="text-xs text-muted-foreground">{stat.percentage}% complete</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Events */}
        <Card className="wedding-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Upcoming Events</span>
            </CardTitle>
            <CardDescription>Your wedding timeline at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border">
                <div className="flex-1">
                  <h4 className="font-semibold">{event.name}</h4>
                  <p className="text-sm text-muted-foreground">{event.venue}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <Badge 
                  variant={event.status === 'confirmed' ? 'default' : 'secondary'}
                  className="capitalize"
                >
                  {event.status}
                </Badge>
              </div>
            ))}
            <Button className="w-full mt-4" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Full Calendar
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="wedding-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Quick Actions</span>
            </CardTitle>
            <CardDescription>Common tasks made easy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action, index) => (
              <Button 
                key={index} 
                className={`w-full justify-start h-12 ${
                  action.variant === 'hero' ? 'hero-button' : 
                  action.variant === 'accent' ? 'accent-button' : ''
                }`}
                variant={action.variant === 'outline' ? 'outline' : undefined}
              >
                <action.icon className="h-5 w-5 mr-3" />
                {action.label}
              </Button>
            ))}
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <span>Catering vendor confirmed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-warning rounded-full"></div>
                  <span>Decoration meeting pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <span>12 new RSVPs received</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button className="hero-button h-14 w-14 rounded-full shadow-lg">
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;