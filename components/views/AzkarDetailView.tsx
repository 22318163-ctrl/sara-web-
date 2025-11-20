
import React, { useState } from 'react';
import { AZKAR_DATA, ICONS } from '../../constants';
import { ZikrItem } from '../../types';
import { useHabitStore } from '../../hooks/useHabitStore';

interface AzkarDetailViewProps {
  type: 'morning' | 'evening' | 'sleep';
  onBack: () => void;
}

const ZikrCard: React.FC<{ item: ZikrItem }> = ({ item }) => {
  const [count, setCount] = useState(item.count);
  const [isFinished, setIsFinished] = useState(false);

  const handleClick = () => {
    if (count > 0) {
      const newCount = count - 1;
      setCount(newCount);
      if (newCount === 0) {
        setIsFinished(true);
      }
    }
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-full text-right p-5 rounded-2xl shadow-sm border transition-all duration-300 relative overflow-hidden ${
        isFinished 
          ? 'bg-light-green/50 border-pastel-green opacity-75' 
          : 'bg-white border-light-green hover:shadow-md'
      }`}
    >
        {isFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
                 <ICONS.check className="w-16 h-16 text-dark-green/50 animate-bounce-subtle" />
            </div>
        )}
        <div className="flex justify-between items-start gap-4">
             <p className={`text-lg leading-relaxed text-dark-green ${isFinished ? 'blur-[1px]' : ''}`}>
                {item.text}
            </p>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
             <span className="text-xs text-soft-gold">{isFinished ? 'انتهيتِ' : 'اضغطي للعد'}</span>
             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors ${
                 isFinished ? 'bg-dark-green text-white' : 'bg-pastel-green text-dark-green'
             }`}>
                 {isFinished ? <ICONS.check className="w-6 h-6"/> : count}
             </div>
        </div>
    </button>
  );
};

const AzkarDetailView: React.FC<AzkarDetailViewProps> = ({ type, onBack }) => {
  const { religiousHabits } = useHabitStore();
  const data = AZKAR_DATA[type];

  const habitIdMap: Record<string, string> = {
    morning: 'r10',
    evening: 'r11',
    sleep: 'r12',
  };

  const currentHabit = religiousHabits.find(h => h.id === habitIdMap[type]);

  const defaultTitles = {
      morning: { title: 'أذكار الصباح', icon: '🌅' },
      evening: { title: 'أذكار المساء', icon: '🌃' },
      sleep: { title: 'أذكار النوم', icon: '🛌' },
  };

  const title = currentHabit ? currentHabit.name : defaultTitles[type].title;
  const icon = currentHabit ? currentHabit.icon : defaultTitles[type].icon;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <header className="flex items-center gap-4 mb-6">
        <button 
            onClick={onBack}
            className="bg-white text-dark-green rounded-full h-10 w-10 flex items-center justify-center shadow-sm hover:bg-light-green transition-colors"
        >
            <ICONS.back className="w-6 h-6 transform rotate-180" /> 
        </button>
        <div className="flex items-center gap-3">
             <span className="text-3xl">{icon}</span>
             <h1 className="text-2xl font-bold text-dark-green">
                {title}
            </h1>
        </div>
      </header>

      <div className="space-y-4">
        {data.map((item, index) => (
          <ZikrCard key={index} item={item} />
        ))}
      </div>
      
      <div className="text-center text-dark-green/60 text-sm mt-8">
          تقبل الله طاعتكم
      </div>
    </div>
  );
};

export default AzkarDetailView;
