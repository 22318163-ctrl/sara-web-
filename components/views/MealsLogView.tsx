
import React from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS } from '../../constants';

const MealsLogView: React.FC = () => {
  const { dailyEntries } = useHabitStore();

  const sortedDates = Object.keys(dailyEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const hasMeals = (entry: any) => {
    const m = entry.meals;
    if (!m) return false;
    return m.breakfast || m.lunch || m.dinner || m.breakfastImage || m.lunchImage || m.dinnerImage;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <h1 className="text-3xl font-bold text-dark-green text-center">سجل وجباتي 📅</h1>
      <div className="space-y-4">
        {sortedDates.map(date => {
           const entry = dailyEntries[date];
           if (!hasMeals(entry)) return null;
           
           const dayName = new Date(date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
           const totalCalories = (entry.meals.breakfastCalories || 0) + (entry.meals.lunchCalories || 0) + (entry.meals.dinnerCalories || 0);

           return (
             <div key={date} className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <div className="flex justify-between items-center mb-4 border-b border-light-green/50 pb-2">
                    <h2 className="font-bold text-dark-green">{dayName}</h2>
                    {totalCalories > 0 && (
                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                             <ICONS.fire className="w-3 h-3" /> {totalCalories} سعرة
                        </span>
                    )}
                </div>
                
                <div className="space-y-4">
                    {/* Breakfast */}
                    {(entry.meals.breakfast || entry.meals.breakfastImage) && (
                        <div className="flex gap-3 items-start bg-light-gray/30 p-3 rounded-xl">
                            {entry.meals.breakfastImage && (
                                <img src={entry.meals.breakfastImage} alt="فطور" className="w-16 h-16 rounded-lg object-cover" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                     <span className="text-xs font-bold text-pastel-green bg-dark-green/5 px-2 py-0.5 rounded-full mb-1 inline-block">فطور</span>
                                     {entry.meals.breakfastCalories && <span className="text-xs text-orange-600 font-bold">{entry.meals.breakfastCalories} سعرة</span>}
                                </div>
                                <p className="text-sm text-dark-green">{entry.meals.breakfast}</p>
                            </div>
                        </div>
                    )}

                    {/* Lunch */}
                    {(entry.meals.lunch || entry.meals.lunchImage) && (
                        <div className="flex gap-3 items-start bg-light-gray/30 p-3 rounded-xl">
                            {entry.meals.lunchImage && (
                                <img src={entry.meals.lunchImage} alt="غداء" className="w-16 h-16 rounded-lg object-cover" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                     <span className="text-xs font-bold text-pastel-green bg-dark-green/5 px-2 py-0.5 rounded-full mb-1 inline-block">غداء</span>
                                     {entry.meals.lunchCalories && <span className="text-xs text-orange-600 font-bold">{entry.meals.lunchCalories} سعرة</span>}
                                </div>
                                <p className="text-sm text-dark-green">{entry.meals.lunch}</p>
                            </div>
                        </div>
                    )}

                    {/* Dinner */}
                    {(entry.meals.dinner || entry.meals.dinnerImage) && (
                        <div className="flex gap-3 items-start bg-light-gray/30 p-3 rounded-xl">
                            {entry.meals.dinnerImage && (
                                <img src={entry.meals.dinnerImage} alt="عشاء" className="w-16 h-16 rounded-lg object-cover" />
                            )}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                     <span className="text-xs font-bold text-pastel-green bg-dark-green/5 px-2 py-0.5 rounded-full mb-1 inline-block">عشاء</span>
                                     {entry.meals.dinnerCalories && <span className="text-xs text-orange-600 font-bold">{entry.meals.dinnerCalories} سعرة</span>}
                                </div>
                                <p className="text-sm text-dark-green">{entry.meals.dinner}</p>
                            </div>
                        </div>
                    )}
                </div>
             </div>
           );
        })}
        
        {sortedDates.filter(d => hasMeals(dailyEntries[d])).length === 0 && (
             <div className="text-center py-10 text-dark-green/50">
                 <p>لا توجد وجبات مسجلة في السجل.</p>
             </div>
        )}
      </div>
    </div>
  );
};
export default MealsLogView;
