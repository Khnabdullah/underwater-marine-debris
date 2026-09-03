import React, { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ConsoleLayout from './components/console/ConsoleLayout';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');

  if (currentView === 'landing') {
    return <LandingPage onOpenWorkbench={() => setCurrentView('workbench')} />;
  }

  return <ConsoleLayout onReturnToLanding={() => setCurrentView('landing')} />;
}
