
import React, { useMemo } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';

const PeriodView: React.FC = () => {
    const { periodData, updatePeriodData } = useHabitStore();

    const prediction = useMemo(() => {
        if (!periodData.lastPeriodStart) return null;

        const lastStart = new Date(periodData.lastPeriodStart);
        const nextPeriodDate = new Date(lastStart);
        nextPeriodDate.setDate(lastStart.getDate() + periodData.cycleLength);

        const now = new Date();
        const diffTime = nextPeriodDate.getTime() - now.getTime();
        const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return {
            nextDate: nextPeriodDate.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }),
            daysUntil
        };
    }, [periodData]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePeriodData({ lastPeriodStart: e.target.value });
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <h1 className="text-3xl font-bold text-pink-800 text-center">دورتي الشهرية 🌸</h1>

            {/* Prediction Card */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-6 rounded-full w-64 h-64 mx-auto flex flex-col items-center justify-center shadow-sm border-4 border-white ring-2 ring-pink-200">
                {prediction ? (
                    <>
                        <p className="text-pink-800/70 text-sm mb-1">موعد الدورة القادم</p>
                        <p className="text-4xl font-bold text-pink-600 mb-2">{prediction.daysUntil}</p>
                        <p className="text-pink-800/70 text-sm">أيام متبقية</p>
                        <p className="text-pink-800 font-bold text-xs mt-3 bg-white/50 px-3 py-1 rounded-full">
                            {prediction.nextDate}
                        </p>
                    </>
                ) : (
                    <div className="text-center px-4">
                        <span className="text-4xl mb-2 block">📅</span>
                        <p className="text-pink-800 text-sm">سجلي تاريخ آخر دورة لحساب الموعد القادم</p>
                    </div>
                )}
            </div>

            {/* Settings Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 space-y-4">
                <h2 className="font-bold text-pink-800 flex items-center gap-2">
                    <span className="text-xl">⚙️</span>
                    إعدادات الدورة
                </h2>

                <div>
                    <label className="block text-sm text-pink-800/80 mb-1">تاريخ بداية آخر دورة</label>
                    <input 
                        type="date" 
                        value={periodData.lastPeriodStart || ''}
                        onChange={handleDateChange}
                        className="w-full bg-pink-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 text-pink-900"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-pink-800/80 mb-1">طول الدورة (يوم)</label>
                        <input 
                            type="number" 
                            value={periodData.cycleLength}
                            onChange={(e) => updatePeriodData({ cycleLength: parseInt(e.target.value) || 28 })}
                            className="w-full bg-pink-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 text-center font-bold text-pink-900"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-pink-800/80 mb-1">مدة الحيض (يوم)</label>
                        <input 
                            type="number" 
                            value={periodData.periodLength}
                            onChange={(e) => updatePeriodData({ periodLength: parseInt(e.target.value) || 5 })}
                            className="w-full bg-pink-50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pink-300 text-center font-bold text-pink-900"
                        />
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
                 <h2 className="font-bold text-pink-800 mb-3">نصائح لهذه الفترة 🌷</h2>
                 <ul className="space-y-2 text-sm text-pink-900/80 list-disc list-inside">
                     <li>اشربي الكثير من المشروبات الدافئة مثل القرفة والبابونج.</li>
                     <li>استخدمي قربة ماء دافئ لتخفيف التقلصات.</li>
                     <li>تناولي الأطعمة الغنية بالحديد والمغنيسيوم.</li>
                     <li>امنحي نفسك قسطاً كافياً من الراحة والنوم.</li>
                 </ul>
            </div>
        </div>
    );
};

export default PeriodView;
