import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import EventScheduler from '@/components/EventScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import AIAssistant from '@/components/AIAssistant';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch user profile when user signs in
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUserProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
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

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard userProfile={userProfile} />;
      case 'events':
        return <EventScheduler />;
      case 'budget':
        return <BudgetTracker />;
      case 'guests':
        return (
          <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--gradient-soft)' }}>
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-serif font-bold gradient-text">Guest List Manager</h1>
              <p className="text-xl text-muted-foreground">Coming Soon! 🎉</p>
              <p className="text-sm text-muted-foreground">Track RSVPs, manage invitations, and organize seating arrangements</p>
            </div>
          </div>
        );
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
