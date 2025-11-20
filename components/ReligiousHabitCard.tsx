
import React from 'react';
import { ReligiousHabit } from '../types';
import { useHabitStore } from '../hooks/useHabitStore';
import { ICONS } from '../constants';

interface ReligiousHabitCardProps {
  habit: ReligiousHabit;
  onClick?: () => void;
}

const ReligiousHabitCard: React.FC<ReligiousHabitCardProps> = ({ habit, onClick }) => {
  const { updateReligiousHabitCount, getReligiousHabitLogForToday } = useHabitStore();
  const log = getReligiousHabitLogForToday(habit.id);
  const count = log?.count || 0;
  const isDone = count > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    updateReligiousHabitCount(habit.id, isDone ? 0 : 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateReligiousHabitCount(habit.id, count + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateReligiousHabitCount(habit.id, count - 1);
  };
  
  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const newCount = parseInt(e.target.value, 10);
    if (!isNaN(newCount)) {
      updateReligiousHabitCount(habit.id, newCount);
    }
  }

  const cardClasses = `p-4 rounded-2xl flex items-center justify-between transition-colors duration-300 shadow-sm border relative overflow-hidden ${
    isDone ? 'bg-light-green border-pastel-green' : 'bg-white border-light-green'
  } ${onClick ? 'cursor-pointer hover:shadow-md' : ''}`;

  const buttonClasses = `px-6 py-2 rounded-full font-bold transition-colors duration-300 text-sm ${
    isDone ? 'bg-dark-green text-white animate-bounce-subtle' : 'bg-light-green text-dark-green hover:bg-pastel-green'
  }`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="flex items-center gap-4 z-10">
        <div className={`text-3xl transition-transform ${isDone ? 'animate-bounce-subtle' : ''}`}>{habit.icon}</div>
        <div>
          <p className={`font-bold text-lg text-dark-green ${isDone && !habit.hasCounter ? 'line-through opacity-70' : ''}`}>
            {habit.name}
          </p>
           {onClick && <p className="text-xs text-soft-gold mt-1">اضغطي للعرض</p>}
        </div>
      </div>
      
      <div className="z-10" onClick={(e) => e.stopPropagation()}>
      {habit.hasCounter ? (
        <div className="flex items-center gap-2">
          <button onClick={handleDecrement} className="bg-pastel-green text-dark-green rounded-full h-8 w-8 text-xl flex items-center justify-center shadow-sm hover:bg-dark-green hover:text-white transition-colors">-</button>
          <input 
            type="number"
            value={count}
            onChange={handleCountChange}
            onClick={(e) => e.stopPropagation()}
            className="w-12 text-center bg-transparent font-bold text-dark-green text-lg outline-none"
            aria-label={`عدد ${habit.name}`}
          />
          <button onClick={handleIncrement} className="bg-pastel-green text-dark-green rounded-full h-8 w-8 text-xl flex items-center justify-center shadow-sm hover:bg-dark-green hover:text-white transition-colors">+</button>
        </div>
      ) : (
        <button onClick={handleToggle} className={buttonClasses}>
          {isDone ? (
            <div className="flex items-center gap-1">
              <ICONS.check className="w-5 h-5" />
              <span>تم</span>
            </div>
          ) : (
            'إنجاز'
          )}
        </button>
      )}
      </div>
    </div>
  );
};

export default ReligiousHabitCard;
