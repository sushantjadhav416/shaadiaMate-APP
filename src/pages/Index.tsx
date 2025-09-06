import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import Login from '@/components/Login';
import EventScheduler from '@/components/EventScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import AIAssistant from '@/components/AIAssistant';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to false for login flow

  if (!isLoggedIn) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
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
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="pb-20 lg:pb-0">
        {renderPage()}
      </main>
      <AIAssistant />
    </div>
  );
};

export default Index;
