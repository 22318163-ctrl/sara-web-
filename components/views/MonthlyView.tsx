
import React, { useMemo } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { Habit } from '../../types';

const StatCard: React.FC<{ title: string; value: string | number; icon: string }> = ({ title, value, icon }) => (
    <div className="bg-light-green/50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
        <span className="text-3xl mb-2">{icon}</span>
        <p className="text-dark-green font-bold text-2xl">{value}</p>
        <p className="text-dark-green/80 text-sm">{title}</p>
    </div>
);

const MonthlyView: React.FC = () => {
    const { habits, habitLogs, dailyEntries, currentWeight, targetWeight, setCurrentWeight, setTargetWeight } = useHabitStore();

    const monthlyStats = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const currentMonthLogs = Object.values(habitLogs).flat().filter(log => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === year && logDate.getMonth() === month;
        });

        const totalPossibleHabits = habits.length * daysInMonth;
        const totalDoneHabits = currentMonthLogs.filter(log => log.done).length;
        const commitmentRate = totalPossibleHabits > 0 ? Math.round((totalDoneHabits / totalPossibleHabits) * 100) : 0;
        
        const excellentDays = Object.values(dailyEntries).filter(entry => {
             const entryDate = new Date(entry.date);
             if (entryDate.getFullYear() !== year || entryDate.getMonth() !== month) return false;
             
             const logsForDay = habitLogs[entry.date] || [];
             return logsForDay.length > 0 && logsForDay.length === habits.length && logsForDay.every(l => l.done);
        }).length;

        const habitCounts: Record<string, number> = {};
        currentMonthLogs.forEach(log => {
            if (log.done) {
                habitCounts[log.habitId] = (habitCounts[log.habitId] || 0) + 1;
            }
        });

        let bestHabit: Habit | null = null;
        let maxCount = 0;
        for (const habitId in habitCounts) {
            if (habitCounts[habitId] > maxCount) {
                maxCount = habitCounts[habitId];
                bestHabit = habits.find(h => h.id === habitId) || null;
            }
        }

        return { commitmentRate, excellentDays, bestHabit };

    }, [habits, habitLogs, dailyEntries]);

    const currentMonthName = new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-dark-green text-center">حصاد {currentMonthName}</h1>

            <div className="grid grid-cols-2 gap-4">
                <StatCard title="نسبة الالتزام" value={`${monthlyStats.commitmentRate}%`} icon="🎯" />
                <StatCard title="أيام ممتازة" value={monthlyStats.excellentDays} icon="🌟" />
            </div>

            {monthlyStats.bestHabit && (
                <div className="bg-white p-4 rounded-xl shadow-sm text-center">
                    <p className="text-dark-green/80">أفضل عادة هذا الشهر</p>
                    <p className="text-2xl font-bold text-dark-green mt-1">{monthlyStats.bestHabit.icon} {monthlyStats.bestHabit.name}</p>
                </div>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-dark-green mb-4">⚖️ تتبع الوزن</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-green/80">الوزن الحالي (كجم)</label>
                        <input 
                            type="number"
                            value={currentWeight || ''}
                            onChange={e => setCurrentWeight(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="--"
                            className="w-full mt-1 bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center font-bold text-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-green/80">الوزن المستهدف (كجم)</label>
                        <input 
                            type="number"
                            value={targetWeight || ''}
                            onChange={e => setTargetWeight(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="--"
                            className="w-full mt-1 bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center font-bold text-lg"
                        />
                    </div>
                </div>
                {currentWeight && targetWeight && (
                    <div className="mt-4 text-center">
                        <p className="text-dark-green">
                            {currentWeight > targetWeight 
                                ? `تبقى لكِ ${ (currentWeight - targetWeight).toFixed(1) } كجم للوصول لهدفكِ!`
                                : `🎉 لقد وصلتِ لهدفكِ!`}
                        </p>
                    </div>
                )}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm">
                 <h2 className="text-xl font-bold text-dark-green mb-2">ماذا تعلمتِ هذا الشهر؟</h2>
                 <textarea 
                    placeholder="اكتبي عن إنجازاتك، تحدياتك، وما تعلمتيه..."
                    className="w-full h-32 bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"
                 />
            </div>
        </div>
    );
};

export default MonthlyView;