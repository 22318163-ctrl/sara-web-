
import React, { useState } from 'react';
import ReligiousHabitCard from '../ReligiousHabitCard';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS } from '../../constants';
import AddReligiousHabitModal from '../AddReligiousHabitModal';
import { Page } from '../../types';

interface ReligiousHabitsViewProps {
    setActivePage: (page: Page) => void;
}

const ReligiousHabitsView: React.FC<ReligiousHabitsViewProps> = ({ setActivePage }) => {
  const { religiousHabits } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleHabitClick = (habitId: string) => {
      if (habitId === 'r10') setActivePage('azkar-morning');
      if (habitId === 'r11') setActivePage('azkar-evening');
      if (habitId === 'r12') setActivePage('azkar-sleep');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div className="text-center flex-grow">
          <h1 className="text-3xl font-bold text-dark-green">العادات الدينية</h1>
          <p className="text-soft-gold italic mt-2 text-sm">"ألا بذكر الله تطمئن القلوب"</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pastel-green text-dark-green rounded-full h-12 w-12 flex items-center justify-center shadow-md hover:bg-dark-green hover:text-white transition-colors flex-shrink-0"
          aria-label="إضافة عادة دينية"
        >
          <ICONS.plus className="h-7 w-7" />
        </button>
      </header>
      
      <div className="space-y-4">
        {religiousHabits.map(habit => (
          <ReligiousHabitCard 
            key={habit.id} 
            habit={habit} 
            onClick={['r10', 'r11', 'r12'].includes(habit.id) ? () => handleHabitClick(habit.id) : undefined}
          />
        ))}
      </div>

      {isModalOpen && <AddReligiousHabitModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default ReligiousHabitsView;
