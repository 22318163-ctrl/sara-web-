
import React, { useState } from 'react';
import { HabitProvider, useHabitStore } from './hooks/useHabitStore';
import BottomNav from './components/BottomNav';
import TodayView from './components/views/TodayView';
import HabitsView from './components/views/HabitsView';
import MoodView from './components/views/MoodView';
import MealsView from './components/views/MealsView';
import MealsLogView from './components/views/MealsLogView';
import JournalView from './components/views/JournalView';
import MonthlyView from './components/views/MonthlyView';
import WelcomeView from './components/views/WelcomeView';
import ReligiousHabitsView from './components/views/ReligiousHabitsView';
import AzkarDetailView from './components/views/AzkarDetailView';
import SportsView from './components/views/SportsView';
import DrinksView from './components/views/DrinksView';
import SelfCareView from './components/views/SelfCareView';
import PeriodView from './components/views/PeriodView';
import WeightView from './components/views/WeightView';
import VitaminsView from './components/views/VitaminsView';
import RecipesView from './components/views/RecipesView';
import { Page } from './types';

const AppContent: React.FC = () => {
  const { userName } = useHabitStore();
  const [activePage, setActivePage] = useState<Page>('today');

  if (!userName) {
    return <WelcomeView />;
  }

  const renderContent = () => {
    switch (activePage) {
      case 'today':
        return <TodayView />;
      case 'habits':
        return <HabitsView />;
      case 'religious':
        return <ReligiousHabitsView setActivePage={setActivePage} />;
      case 'mood':
        return <MoodView />;
      case 'meals':
        return <MealsView />;
      case 'meals-log':
        return <MealsLogView />;
      case 'sports':
        return <SportsView />;
      case 'drinks':
        return <DrinksView />;
      case 'self-care':
        return <SelfCareView />;
      case 'period':
        return <PeriodView />;
      case 'weight':
        return <WeightView />;
      case 'vitamins':
        return <VitaminsView />;
      case 'recipes':
        return <RecipesView />;
      case 'journal':
        return <JournalView />;
      case 'monthly':
        return <MonthlyView />;
      case 'azkar-morning':
        return <AzkarDetailView type="morning" onBack={() => setActivePage('religious')} />;
      case 'azkar-evening':
        return <AzkarDetailView type="evening" onBack={() => setActivePage('religious')} />;
      case 'azkar-sleep':
        return <AzkarDetailView type="sleep" onBack={() => setActivePage('religious')} />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-creamy text-dark-green pb-24">
      <div className="container mx-auto p-4 max-w-lg">
        {renderContent()}
      </div>
      <BottomNav activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
};

export default App;
