
import React, { useRef } from 'react';
import { Habit } from '../types';
import { useHabitStore } from '../hooks/useHabitStore';
import { ICONS } from '../constants';

// Simple sound effects (Base64)
const DONE_SOUND = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBURW5jAAAAJHLaF6Z/AAAAAAAAAAAAAABJbmZvAAAADwAAAAwAAAbgAAUFBQ4ODhcXFCAgICkpKTExMT8/P0JCQk9PT1lZWWJiYmpqanNzc35+foKCgo2NjaOjo6urq7Ozs76+vsLCwsnJydfX197e3uXl5e7u7vPz8////wAAAAATTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUaAAAAAAAAAAAAAAAAS2hvbWUBZQAAAAwAAAbgR6Y84AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAA04E0E094AAIYJowA5wgAAA0gAAAAABAAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAAD/+5BkAAADfQTTjT3gAAhYmjADnCAADTgTQTT3gAAhImjADnCAAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAAP/7kGQAAANOBNBNPeAACGCaMAOcIAANOBNBNPeAACGCaMAOcIAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAA//uQZAAAA34E04094AAIWJowA5wgAA04E0E094AAIYJowA5wgAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAAA//uQZAAAA04E0E094AAIYJowA5wgAA04E0E094AAIYJowA5wgAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAA";
const UNDONE_SOUND = "data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=="; // Very short empty sound for now as placeholder or simple click

interface HabitCardProps {
  habit: Habit;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit }) => {
  const { logHabit, getHabitLogForToday } = useHabitStore();
  const log = getHabitLogForToday(habit.id);
  const isDone = log?.done || false;
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = (done: boolean) => {
      const sound = done ? DONE_SOUND : UNDONE_SOUND;
      if (done) {
        if (!audioRef.current) {
            audioRef.current = new Audio(sound);
        } else {
            audioRef.current.src = sound;
        }
        audioRef.current.play().catch(e => console.error("Audio play failed", e));
      }
  };

  const handleToggle = () => {
    const newState = !isDone;
    logHabit(habit.id, newState);
    playSound(newState);
  };

  const cardClasses = `p-4 rounded-2xl flex items-center justify-between transition-colors duration-300 shadow-sm border ${
    isDone ? 'bg-light-green border-pastel-green' : 'bg-white border-light-green'
  }`;

  const buttonClasses = `px-6 py-2 rounded-full font-bold transition-all duration-200 text-sm active:scale-95 ${
    isDone ? 'bg-dark-green text-white animate-bounce-subtle' : 'bg-light-green text-dark-green hover:bg-pastel-green'
  }`;

  // Convert 24h time to 12h format for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className={cardClasses}>
      <div className="flex items-center gap-4">
        <div className={`text-3xl transition-transform ${isDone ? 'animate-bounce-subtle' : ''}`}>{habit.icon}</div>
        <div>
          <p className={`font-bold text-lg text-dark-green ${isDone ? 'line-through opacity-70' : ''}`}>{habit.name}</p>
          <div className="flex items-center gap-2 text-sm text-dark-green/70">
             <span className={`${isDone ? 'line-through' : ''}`}>{habit.goal}</span>
             {habit.reminderTime && (
                 <div className="flex items-center gap-1 bg-light-gray/50 px-2 py-0.5 rounded-full">
                     <ICONS.bell className="w-3 h-3" />
                     <span className="text-xs">{formatTime(habit.reminderTime)}</span>
                 </div>
             )}
          </div>
        </div>
      </div>
      <button onClick={handleToggle} className={buttonClasses}>
        {isDone ? (
          <div className="flex items-center gap-1">
            <span>تم</span>
            <ICONS.check className="w-5 h-5" />
          </div>
        ) : (
          'إنجاز اليوم'
        )}
      </button>
    </div>
  );
};

export default HabitCard;
