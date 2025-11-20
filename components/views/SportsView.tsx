
import React, { useState, useEffect, useRef } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS, EXERCISE_SUGGESTIONS } from '../../constants';

// Simple "Ding" sound (Base64 MP3)
const ALARM_SOUND = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgBURW5jAAAAJHLaF6Z/AAAAAAAAAAAAAABJbmZvAAAADwAAAAwAAAbgAAUFBQ4ODhcXFCAgICkpKTExMT8/P0JCQk9PT1lZWWJiYmpqanNzc35+foKCgo2NjaOjo6urq7Ozs76+vsLCwsnJydfX197e3uXl5e7u7vPz8////wAAAAATTEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVUaAAAAAAAAAAAAAAAAS2hvbWUBZQAAAAwAAAbgR6Y84AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//uQZAAAA04E0E094AAIYJowA5wgAAA0gAAAAABAAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAAD/+5BkAAADfQTTjT3gAAhYmjADnCAADTgTQTT3gAAhImjADnCAAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAAP/7kGQAAANOBNBNPeAACGCaMAOcIAANOBNBNPeAACGCaMAOcIAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAA//uQZAAAA34E04094AAIWJowA5wgAA04E0E094AAIYJowA5wgAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAAA//uQZAAAA04E0E094AAIYJowA5wgAA04E0E094AAIYJowA5wgAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAB/6gAAf+oAAH/qAAA";

const Timer: React.FC<{ initialMinutes: number }> = ({ initialMinutes }) => {
    const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setTimeLeft(initialMinutes * 60);
        setIsActive(false);
    }, [initialMinutes]);

    useEffect(() => {
        let interval: number | undefined;

        if (isActive && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            // Timer Finished
            setIsActive(false);
            playAlarm();
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const playAlarm = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio(ALARM_SOUND);
        }
        audioRef.current.play().catch(e => console.error("Error playing sound", e));
        
        // Trigger vibration if supported
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }

        // Browser notification
        if (Notification.permission === "granted") {
            new Notification("انتهى الوقت! 🎉", { body: "أحسنتِ! لقد أتممتِ التمرين." });
        }
    };

    const formatTime = (seconds: number) => {
        const getSeconds = `0${(seconds % 60)}`.slice(-2);
        const minutes = Math.floor(seconds / 60);
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(seconds / 3600)}`.slice(-2);
        
        if (Math.floor(seconds / 3600) > 0) {
             return `${getHours}:${getMinutes}:${getSeconds}`;
        }
        return `${getMinutes}:${getSeconds}`;
    };

    const totalSeconds = initialMinutes * 60;
    const progress = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-light-green flex flex-col items-center relative overflow-hidden">
            {/* Progress Bar Background */}
            <div className="absolute bottom-0 left-0 h-2 bg-pastel-green transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }}></div>

            <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                <span className={`${isActive ? 'animate-pulse' : ''}`}>⏱️</span> 
                مؤقت التمرين (عد تنازلي)
            </h2>
            
            <div className={`text-6xl font-mono mb-6 font-bold tracking-wider transition-colors ${timeLeft < 10 && isActive ? 'text-red-500 animate-pulse' : 'text-dark-green'}`}>
                {formatTime(timeLeft)}
            </div>
            
            <div className="flex gap-4">
                <button 
                    onClick={() => setIsActive(!isActive)} 
                    className={`px-8 py-3 rounded-full font-bold transition-all w-36 shadow-md ${isActive ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-dark-green text-white hover:bg-opacity-90'}`}
                >
                    {isActive ? 'إيقاف مؤقت' : (timeLeft < totalSeconds && timeLeft > 0 ? 'استئناف' : 'ابدأ')}
                </button>
                <button 
                    onClick={() => { setTimeLeft(totalSeconds); setIsActive(false); }} 
                    className="px-6 py-3 rounded-full bg-light-gray text-dark-green font-bold hover:bg-gray-200 transition-colors shadow-sm"
                >
                    إعادة
                </button>
            </div>
        </div>
    );
};

const SportsView: React.FC = () => {
    const { todayEntry, addExercise, deleteExercise } = useHabitStore();
    const [name, setName] = useState('');
    const [duration, setDuration] = useState('');
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [timerDuration, setTimerDuration] = useState(0);

    const categories = ['الكل', 'كارديو', 'جزء علوي', 'جزء سفلي', 'بطن', 'مرونة'];
    
    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !duration) return;
        
        const dur = parseInt(duration);
        const suggestion = EXERCISE_SUGGESTIONS.find(s => s.name === name);
        const calorieRate = suggestion ? suggestion.calories : 5; 
        
        const calories = Math.round(dur * calorieRate); 
        addExercise(name, dur, calories);
        setDuration('');
    };

    const handleSuggestionClick = (suggestion: typeof EXERCISE_SUGGESTIONS[0]) => {
        setName(suggestion.name);
        setDuration(suggestion.duration.toString());
        setTimerDuration(suggestion.duration); // Auto-set timer
    };

    const totalCaloriesBurned = (todayEntry.exercises || []).reduce((acc, curr) => acc + curr.caloriesBurned, 0);
    const totalDuration = (todayEntry.exercises || []).reduce((acc, curr) => acc + curr.durationMinutes, 0);

    const filteredSuggestions = activeCategory === 'الكل' 
        ? EXERCISE_SUGGESTIONS 
        : EXERCISE_SUGGESTIONS.filter(s => s.category === activeCategory);

    // Update timer when manual input changes
    useEffect(() => {
        const dur = parseInt(duration);
        if (!isNaN(dur) && dur > 0) {
            setTimerDuration(dur);
        }
    }, [duration]);

    return (
        <div className="space-y-6 animate-fade-in pb-24">
             <h1 className="text-3xl font-bold text-dark-green">نادي رياضي</h1>

             {/* Summary Card */}
             <div className="bg-gradient-to-r from-pastel-green to-light-green p-5 rounded-2xl shadow-sm text-dark-green flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg">نشاط اليوم</p>
                    <p className="text-sm opacity-80">استمري في الحركة!</p>
                </div>
                <div className="text-left">
                    <p className="text-2xl font-bold">{totalCaloriesBurned} <span className="text-xs font-normal">سعرة</span></p>
                    <p className="text-sm">{totalDuration} دقيقة</p>
                </div>
             </div>

             {/* Smart Countdown Timer */}
             <Timer initialMinutes={timerDuration} />

             {/* Suggestions */}
             <div>
                <h3 className="font-bold text-dark-green mb-3 px-1">اقتراحات للنشاط</h3>
                
                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                                activeCategory === cat 
                                ? 'bg-dark-green text-white' 
                                : 'bg-white border border-light-green text-dark-green hover:bg-light-green'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button 
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex-shrink-0 bg-white border border-light-green rounded-xl p-3 min-w-[100px] flex flex-col items-center justify-center gap-1 hover:bg-light-green/30 transition-colors shadow-sm group"
                        >
                            <span className="text-2xl group-hover:scale-110 transition-transform">{suggestion.icon}</span>
                            <span className="text-xs font-bold text-dark-green">{suggestion.name}</span>
                            <span className="text-[10px] text-dark-green/60">{suggestion.duration} دقيقة</span>
                        </button>
                    ))}
                </div>
             </div>

             {/* Add Exercise Form */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                    <ICONS.plus className="w-5 h-5" />
                    تسجيل تمرين
                </h2>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="نوع التمرين (مثلاً: مشي)" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-light-gray p-3 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green w-full"
                        />
                        <input 
                            type="number" 
                            placeholder="المدة (دقيقة)" 
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="bg-light-gray p-3 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green w-full"
                        />
                    </div>
                    <button type="submit" className="w-full bg-dark-green text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors">
                        حفظ في السجل
                    </button>
                </form>
             </div>

             {/* Detailed Exercise Summary Section */}
             <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <h3 className="font-bold text-dark-green mb-4 text-lg flex items-center gap-2">
                    <ICONS.sports className="w-5 h-5" />
                    سجل النشاط اليومي
                </h3>
                
                {(todayEntry.exercises || []).length > 0 ? (
                    <>
                        <div className="space-y-3 mb-4">
                            {todayEntry.exercises.map(ex => (
                                <div key={ex.id} className="flex justify-between items-center bg-light-gray/50 p-3 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white p-2 rounded-full text-xl shadow-sm">
                                            {EXERCISE_SUGGESTIONS.find(s => s.name === ex.name)?.icon || '🏃‍♀️'}
                                        </div>
                                        <div>
                                            <span className="font-bold text-dark-green block text-sm">{ex.name}</span>
                                            <span className="text-xs text-dark-green/60">{ex.durationMinutes} دقيقة</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-left">
                                            <span className="block font-bold text-soft-gold text-sm">{ex.caloriesBurned}</span>
                                            <span className="text-[10px] text-dark-green/50">سعرة</span>
                                        </div>
                                        <button onClick={() => deleteExercise(ex.id)} className="text-red-400 hover:text-red-600 p-1">
                                            <ICONS.trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Totals Footer */}
                        <div className="border-t border-light-green pt-4 flex justify-around items-center">
                            <div className="text-center">
                                <p className="text-xs text-dark-green/60 mb-1">المدة الكلية</p>
                                <p className="text-xl font-bold text-dark-green">{totalDuration} <span className="text-sm font-normal">دقيقة</span></p>
                            </div>
                            <div className="h-8 w-px bg-light-green"></div>
                            <div className="text-center">
                                <p className="text-xs text-dark-green/60 mb-1">مجموع الحرق</p>
                                <p className="text-xl font-bold text-dark-green">{totalCaloriesBurned} <span className="text-sm font-normal">سعرة</span></p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8 text-dark-green/40 flex flex-col items-center gap-2">
                        <span className="text-4xl opacity-50">👟</span>
                        <p>لا يوجد نشاط مسجل اليوم</p>
                    </div>
                )}
             </div>
        </div>
    );
};

export default SportsView;
