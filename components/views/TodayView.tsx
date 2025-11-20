
import React, { useMemo, useState, useEffect } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { QUOTES, MOOD_OPTIONS, GREETINGS, ICONS } from '../../constants';
import ProgressBarCircle from '../ProgressBarCircle';
import { Mood } from '../../types';
import SettingsModal from '../SettingsModal';

const TodayView: React.FC = () => {
  const { todayEntry, updateMood, updateWater, toggleChiaWater, updateTask, updateTaskText, updateMeals, updateNotes, habits, habitLogs, userName } = useHabitStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const randomGreeting = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
    setGreeting(randomGreeting);
  }, []);

  const todayQuote = useMemo(() => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return QUOTES[dayOfYear % QUOTES.length];
  }, []);
  
  const today = new Date().toISOString().split('T')[0];
  const todayHabitLogs = habitLogs[today] || [];
  const habitsDoneCount = todayHabitLogs.filter(log => log.done).length;
  const totalHabits = habits.length;
  const progressPercent = totalHabits > 0 ? (habitsDoneCount / totalHabits) * 100 : 0;

  const todayFormatted = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Helper to render visual water glasses
  const renderWaterCups = () => {
      const target = 8; // Daily goal
      const cups = [];
      for (let i = 1; i <= target; i++) {
          const isFilled = i <= todayEntry.waterCount;
          cups.push(
              <button 
                key={i} 
                onClick={() => updateWater(isFilled ? i - 1 : i)} // Toggle logic for clicking specific cup
                className="relative group w-8 h-10 flex items-end justify-center transition-all duration-300"
                aria-label={`كوب ماء ${i}`}
              >
                  {/* Glass Outline */}
                  <div className={`absolute inset-0 border-2 border-b-4 rounded-b-xl rounded-t-sm transition-colors duration-300 ${isFilled ? 'border-blue-300' : 'border-gray-300'}`}></div>
                  
                  {/* Water Fill */}
                  <div 
                    className={`w-full mx-[2px] mb-[2px] rounded-b-[10px] transition-all duration-500 ease-in-out bg-gradient-to-t from-blue-400 to-blue-200 ${isFilled ? 'h-[80%] opacity-100' : 'h-0 opacity-0'}`}
                  ></div>
                  
                  {/* Reflection/Shine */}
                  <div className="absolute top-2 right-1 w-1 h-4 bg-white/30 rounded-full transform rotate-12 pointer-events-none"></div>
              </button>
          );
      }
      return cups;
  };

  return (
    <div className="space-y-5 animate-fade-in pb-24">
      {/* Header Section */}
      <header className="relative flex justify-between items-start pt-2">
        <div>
            <p className="text-dark-green/60 text-sm font-bold mb-1">{todayFormatted}</p>
            <h1 className="text-2xl font-bold text-dark-green leading-tight">
                {greeting}<br/>
                <span className="text-3xl text-dark-green/90">{userName}</span>
            </h1>
        </div>
        <button 
            onClick={() => setIsSettingsOpen(true)}
            className="bg-white p-2 rounded-full shadow-sm text-dark-green/70 hover:text-dark-green transition-colors"
        >
            <ICONS.settings className="w-6 h-6" />
        </button>
      </header>

      {/* Quote Card */}
      <div className="bg-gradient-to-r from-soft-gold/10 to-creamy p-4 rounded-xl border border-soft-gold/30 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 text-soft-gold/10">
              <ICONS.notes className="w-24 h-24" />
          </div>
          <p className="text-dark-green/80 italic text-sm relative z-10 font-medium text-center leading-relaxed">
            "{todayQuote.text}"
          </p>
      </div>

      {/* Progress Section */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-light-green">
          <div className="flex-1">
              <h2 className="font-bold text-dark-green text-lg mb-1">إنجازك اليومي</h2>
              <p className="text-xs text-dark-green/60 mb-2">كل خطوة صغيرة تصنع فرقاً كبيراً ✨</p>
              <p className="text-sm font-bold text-dark-green">
                 {progressPercent < 100 ? `أتممتِ ${habitsDoneCount} من ${totalHabits} عادة` : "أنتِ رائعة! يوم مثالي 🌟"}
              </p>
          </div>
          <div className="transform scale-75 origin-left rtl:origin-right">
               <ProgressBarCircle progress={progressPercent} size={100} strokeWidth={8} />
          </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 gap-5">
          
          {/* Mood & Water Row */}
          <div className="grid grid-cols-2 gap-4">
              {/* Mood Card */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green flex flex-col items-center justify-center text-center">
                  <h2 className="text-sm font-bold text-dark-green mb-3 flex items-center gap-1">
                      <ICONS.mood className="w-4 h-4" /> مزاجي
                  </h2>
                  <div className="grid grid-cols-3 gap-2">
                      {MOOD_OPTIONS.map(mood => (
                          <button 
                            key={mood}
                            onClick={() => updateMood(mood as Mood)}
                            className={`text-2xl transition-all duration-200 ${todayEntry.mood === mood ? 'transform scale-125 drop-shadow-md' : 'opacity-40 hover:opacity-80'}`}
                          >
                            {mood}
                          </button>
                      ))}
                  </div>
                  <p className="text-[10px] text-dark-green/50 mt-2">
                      {todayEntry.mood ? 'تم التسجيل' : 'كيف تشعرين؟'}
                  </p>
              </div>

              {/* Water Card */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green flex flex-col items-center">
                  <h2 className="text-sm font-bold text-dark-green mb-2 flex items-center gap-1">
                      <ICONS.water className="w-4 h-4 text-blue-400" /> الماء
                  </h2>
                  <div className="flex flex-wrap justify-center gap-2 mb-2">
                      {renderWaterCups()}
                  </div>
                  <div className="w-full border-t border-dashed border-light-green/50 my-2"></div>
                  <button 
                    onClick={toggleChiaWater}
                    className={`flex items-center gap-1 text-xs py-1 px-2 rounded-full transition-colors ${todayEntry.chiaWater ? 'bg-pastel-green text-dark-green font-bold' : 'bg-gray-100 text-gray-400'}`}
                  >
                      <span>{todayEntry.chiaWater ? '✅' : '⚪'}</span>
                      <span>ماء الشيا</span>
                  </button>
              </div>
          </div>

          {/* Tasks Card */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
             <h2 className="text-lg font-bold text-dark-green mb-4 flex items-center gap-2">
                <span className="bg-pastel-green/30 p-1.5 rounded-lg"><ICONS.tasks className="w-5 h-5" /></span>
                أهم 3 أولويات
             </h2>
             <div className="space-y-3">
                {todayEntry.tasks.map((task, idx) => (
                  <div key={task.id} className="group flex items-center gap-3 bg-light-gray/30 p-2 rounded-xl transition-colors hover:bg-light-gray/60">
                    <div className="relative flex items-center">
                        <input 
                          type="checkbox"
                          checked={task.done}
                          onChange={e => updateTask(task.id, e.target.checked)}
                          className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-pastel-green transition-all checked:border-dark-green checked:bg-dark-green"
                        />
                         <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                    <input
                      type="text"
                      value={task.text}
                      onChange={(e) => updateTaskText(task.id, e.target.value)}
                      placeholder={idx === 0 ? "الأولوية الأولى..." : idx === 1 ? "الأولوية الثانية..." : "شيء لطيف لنفسك..."}
                      className={`w-full bg-transparent border-none outline-none text-sm transition-colors ${task.done ? 'line-through text-gray-400' : 'text-dark-green placeholder-dark-green/30'}`}
                    />
                  </div>
                ))}
             </div>
          </div>

          {/* Meals Summary (Compact) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
              <h2 className="text-lg font-bold text-dark-green mb-4 flex items-center gap-2">
                <span className="bg-pastel-green/30 p-1.5 rounded-lg"><ICONS.meals className="w-5 h-5" /></span>
                ملخص الوجبات
             </h2>
             <div className="grid grid-cols-1 gap-2 text-sm">
                 <input 
                    type="text" 
                    placeholder="🍳 الفطور..." 
                    value={todayEntry.meals.breakfast} 
                    onChange={e => updateMeals({ breakfast: e.target.value })} 
                    className="w-full bg-light-gray/50 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-pastel-green hover:bg-light-gray transition-colors"
                 />
                 <input 
                    type="text" 
                    placeholder="🍲 الغداء..." 
                    value={todayEntry.meals.lunch} 
                    onChange={e => updateMeals({ lunch: e.target.value })} 
                    className="w-full bg-light-gray/50 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-pastel-green hover:bg-light-gray transition-colors"
                 />
                 <input 
                    type="text" 
                    placeholder="🥗 العشاء..." 
                    value={todayEntry.meals.dinner} 
                    onChange={e => updateMeals({ dinner: e.target.value })} 
                    className="w-full bg-light-gray/50 p-2.5 rounded-xl outline-none focus:ring-1 focus:ring-pastel-green hover:bg-light-gray transition-colors"
                 />
             </div>
          </div>

          {/* Notes */}
          <div className="bg-creamy/50 p-4 rounded-2xl border border-pastel-green/50">
            <h2 className="text-sm font-bold text-dark-green mb-2 flex items-center gap-2">
                 <ICONS.notes className="w-4 h-4" /> خواطر سريعة
            </h2>
            <textarea
                placeholder="مساحة حرة لأفكارك..."
                value={todayEntry.notes}
                onChange={e => updateNotes(e.target.value)}
                className="w-full h-20 bg-white p-3 rounded-xl outline-none focus:ring-1 focus:ring-pastel-green text-sm resize-none shadow-inner"
            />
          </div>
      </div>
      
      {isSettingsOpen && <SettingsModal onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
};

export default TodayView;
