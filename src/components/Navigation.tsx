import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart,
  LayoutDashboard,
  Calendar,
  DollarSign,
  Users,
  Store,
  CheckSquare,
  MessageCircle,
  Menu,
  X,
  Bell,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  userProfile?: any;
  onSignOut?: () => void;
}

const Navigation = ({ currentPage, onPageChange, userProfile, onSignOut }: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'budget', label: 'Budget', icon: DollarSign },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  ];

  const NavItem = ({ item, mobile = false }: { item: typeof navItems[0]; mobile?: boolean }) => (
    <button
      onClick={() => {
        onPageChange(item.id);
        if (mobile) setIsMobileMenuOpen(false);
      }}
      className={cn(
        "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
        "hover:bg-secondary/50 hover:scale-105",
        currentPage === item.id 
          ? "bg-primary/10 text-primary border border-primary/20" 
          : "text-muted-foreground hover:text-foreground",
        mobile ? "w-full justify-start" : ""
      )}
    >
      <item.icon className="h-5 w-5" />
      <span className="font-medium">{item.label}</span>
      {item.id === 'tasks' && (
        <Badge variant="secondary" className="ml-auto text-xs">3</Badge>
      )}
    </button>
  );

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center justify-between p-6 bg-card/80 backdrop-blur-md border-b border-border/50">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Heart className="h-8 w-8 text-primary animate-glow" fill="currentColor" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-accent rounded-full animate-float"></div>
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold gradient-text">ShaadiMate</h1>
            <p className="text-xs text-muted-foreground">Wedding Planner</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex items-center space-x-2">
          {navItems.map((item) => (
            <NavItem key={item.id} item={item} />
          ))}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full"></div>
          </Button>
          
          <Button variant="ghost" size="sm" className="relative">
            <MessageCircle className="h-5 w-5" />
            <Badge variant="secondary" className="absolute -top-2 -right-2 text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
              2
            </Badge>
          </Button>

          <div className="h-6 w-px bg-border"></div>

          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSignOut}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <User className="h-5 w-5 mr-2" />
            <span className="font-medium">
              {userProfile?.display_name || userProfile?.first_name || 'User'}
            </span>
          </Button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            <span className="text-lg font-serif font-bold gradient-text">ShaadiMate</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/50 p-4 space-y-2">
            {navItems.map((item) => (
              <NavItem key={item.id} item={item} mobile />
            ))}
            <div className="pt-4 border-t border-border/50">
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-colors" 
                onClick={onSignOut}
              >
                <User className="h-5 w-5 mr-3" />
                <span>Sign Out ({userProfile?.display_name || userProfile?.first_name || 'User'})</span>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50 p-2">
        <div className="grid grid-cols-4 gap-1">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200",
                currentPage === item.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navigation;