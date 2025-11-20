
import React, { useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import HabitCard from '../HabitCard';
import AddHabitModal from '../AddHabitModal';
import { ICONS } from '../../constants';

const HabitsView: React.FC = () => {
  const { habits } = useHabitStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-dark-green">عاداتي</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pastel-green text-dark-green rounded-full h-12 w-12 flex items-center justify-center shadow-md hover:bg-dark-green hover:text-white transition-colors"
        >
          <ICONS.plus className="h-7 w-7" />
        </button>
      </header>
      
      {habits.length > 0 ? (
        <div className="space-y-4">
          {habits.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-dark-green/70">لم تضيفي أي عادات بعد.</p>
          <p className="text-dark-green/70">اضغطي على زر + للبدء.</p>
        </div>
      )}

      {isModalOpen && <AddHabitModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default HabitsView;
