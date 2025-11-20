
import React from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import MoodChart from '../MoodChart';

const MoodView: React.FC = () => {
    const { dailyEntries } = useHabitStore();

    const moodHistory = Object.values(dailyEntries)
        .filter(entry => entry.mood)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 30); // Show last 30 entries

    return (
        <div className="space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold text-dark-green">سجل المزاج</h1>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green">
                <h2 className="text-xl font-bold mb-4 text-dark-green">تقلب المزاج الشهري</h2>
                {moodHistory.length > 0 ? (
                    <MoodChart data={moodHistory} />
                ) : (
                    <p className="text-center text-dark-green/70 py-8">لا يوجد سجل للمزاج بعد.</p>
                )}
            </div>

            <div className="space-y-3">
                <h2 className="text-xl font-bold text-dark-green">السجل اليومي</h2>
                {moodHistory.map(entry => (
                    <div key={entry.date} className="bg-white/80 p-3 rounded-xl flex items-center justify-between shadow-sm">
                        <span className="font-bold text-dark-green">
                            {new Date(entry.date).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-3xl">{entry.mood}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MoodView;
