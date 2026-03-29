import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import EventScheduler from '@/components/EventScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import AIAssistant from '@/components/AIAssistant';
import GuestManager from '@/components/GuestManager';
import GuestDashboard from '@/components/GuestDashboard';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUserProfile(session.user.id), 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for invite token in URL - must be before any early returns
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    if (inviteToken && user) {
      supabase.functions.invoke('guest-management', {
        body: { action: 'claim-invite', inviteToken },
      }).then(() => {
        window.history.replaceState({}, '', window.location.pathname);
      });
    }
  }, [user]);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data && !error) {
      setUserProfile(data);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={() => {}} />;
  }

  const isGuestUser = userProfile?.role === 'guest';

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userProfile={userProfile} />;
      case 'events':
        return <EventScheduler />;
      case 'budget':
        return <BudgetTracker />;
      case 'guests':
        return <GuestManager />;
      case 'vendors':
        return (
          <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--gradient-soft)' }}>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-bold gradient-text">Vendor Manager</h1>
              <p className="text-xl text-muted-foreground">Coming Soon! 🛍️</p>
              <p className="text-sm text-muted-foreground">Manage vendor contracts, payments, and communication</p>
            </div>
          </div>
        );
      case 'tasks':
        return (
          <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--gradient-soft)' }}>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-bold gradient-text">Tasks & Checklist</h1>
              <p className="text-xl text-muted-foreground">Coming Soon! ✅</p>
              <p className="text-sm text-muted-foreground">Stay organized with timeline-based task management</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  if (isGuestUser) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="flex items-center justify-between p-6 bg-card/80 backdrop-blur-md border-b border-border/50">
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-primary" fill="currentColor" />
            <div>
              <h1 className="text-xl font-serif font-bold gradient-text">ShaadiMate</h1>
              <p className="text-xs text-muted-foreground">Guest Portal</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={async () => {
              await supabase.auth.signOut();
              setUserProfile(null);
            }}
          >
            Sign Out
          </Button>
        </nav>
        <main className="pb-20 lg:pb-0">
          <GuestDashboard userProfile={userProfile} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage} 
        userProfile={userProfile}
        onSignOut={async () => {
          await supabase.auth.signOut();
          setUserProfile(null);
          setCurrentPage('dashboard');
        }}
      />
      <main className="pb-20 lg:pb-0">
        {renderPage()}
      </main>
      <AIAssistant />
    </div>
  );
};

export default Index;
