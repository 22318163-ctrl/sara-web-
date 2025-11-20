
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DailyEntry, Habit, HabitLog, Meals, Mood, Task, ReligiousHabit, ReligiousHabitLog, Exercise, DrinkLog, PeriodData, DiyMask, Recipe } from '../types';
import { INITIAL_HABITS, INITIAL_RELIGIOUS_HABITS, DIY_MASKS } from '../constants';

interface HabitContextType {
  userName: string | null;
  setUserName: (name: string) => void;
  habits: Habit[];
  dailyEntries: Record<string, DailyEntry>;
  habitLogs: Record<string, HabitLog[]>;
  todayEntry: DailyEntry;
  updateMood: (mood: Mood) => void;
  updateWater: (newCount: number) => void;
  toggleChiaWater: () => void; // New function
  updateTask: (taskId: number, done: boolean) => void;
  updateTaskText: (taskId: number, text: string) => void;
  updateMeals: (meals: Partial<Meals>) => void;
  updateNotes: (notes: string) => void;
  logHabit: (habitId: string, done: boolean) => void;
  getHabitLogForToday: (habitId: string) => HabitLog | undefined;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateJournal: (text: string, image?: string) => void;
  currentWeight: number | null;
  targetWeight: number | null;
  setCurrentWeight: (weight: number | null) => void;
  setTargetWeight: (weight: number | null) => void;
  height: number | null;
  age: number | null;
  activityLevel: number | null;
  setHeight: (val: number | null) => void;
  setAge: (val: number | null) => void;
  setActivityLevel: (val: number | null) => void;
  religiousHabits: ReligiousHabit[];
  addReligiousHabit: (habit: Omit<ReligiousHabit, 'id'>) => void;
  religiousHabitLogs: Record<string, ReligiousHabitLog[]>;
  updateReligiousHabitCount: (habitId: string, count: number) => void;
  getReligiousHabitLogForToday: (habitId: string) => ReligiousHabitLog | undefined;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  requestNotificationPermission: () => void;
  notificationsEnabled: boolean;
  addExercise: (name: string, duration: number, calories: number) => void;
  deleteExercise: (id: string) => void;
  addDrink: (name: string, icon: string, type: 'hot' | 'cold' | 'femininity') => void;
  deleteDrink: (id: string) => void;
  periodData: PeriodData;
  updatePeriodData: (data: Partial<PeriodData>) => void;
  customMasks: DiyMask[];
  addCustomMask: (mask: DiyMask) => void;
  customRecipes: Recipe[];
  addCustomRecipe: (recipe: Recipe) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Helper to check for localStorage availability
const isStorageAvailable = () => {
  try {
    const testKey = '__test_storage__';
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};
const storageAvailable = isStorageAvailable();


const safeJSONParse = <T>(key: string, fallback: T): T => {
    if (!storageAvailable) return fallback;

    const saved = localStorage.getItem(key);
    if (saved === null) return fallback;

    try {
        const parsed = JSON.parse(saved);
        return parsed ?? fallback;
    } catch (error) {
        console.error(`Error parsing ${key} from localStorage. Removing item.`, error);
        localStorage.removeItem(key);
        return fallback;
    }
};

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const createNewDailyEntry = (date: string): DailyEntry => ({
  date,
  mood: null,
  waterCount: 0,
  chiaWater: false,
  meals: { 
    breakfast: '', 
    lunch: '', 
    dinner: '',
    breakfastCalories: undefined,
    lunchCalories: undefined,
    dinnerCalories: undefined,
  },
  tasks: [
    { id: 1, text: '', done: false },
    { id: 2, text: '', done: false },
    { id: 3, text: '', done: false },
  ],
  exercises: [],
  drinks: [],
  notes: '',
  journal: '',
});

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userName, setUserNameState] = useState<string | null>(() => {
    if (!storageAvailable) return null;
    return localStorage.getItem('userName');
  });
  const [habits, setHabits] = useState<Habit[]>(() => {
    const stored = safeJSONParse('habits', INITIAL_HABITS);
    if (!Array.isArray(stored)) {
        return INITIAL_HABITS;
    }
    // Filter out invalid entries to prevent crashes from malformed data.
    return stored.filter(h => h && typeof h === 'object' && h.id && h.name);
  });
  const [dailyEntries, setDailyEntries] = useState<Record<string, DailyEntry>>(() => {
    let entries = safeJSONParse('dailyEntries', {});

    // Ensure entries is a valid object, not an array or primitive.
    if (typeof entries !== 'object' || entries === null || Array.isArray(entries)) {
      entries = {};
    }

    const today = getTodayDateString();

    // Ensure today's entry exists before sanitizing
    if (!entries[today]) {
      entries[today] = createNewDailyEntry(today);
    }
    
    // Sanitize all entries to prevent crashes from old data structures.
    Object.keys(entries).forEach(date => {
        const defaultEntry = createNewDailyEntry(date);
        const existingEntry = entries[date];

        // If an entry from localStorage is malformed (not an object), replace it with a default one.
        if (typeof existingEntry !== 'object' || existingEntry === null) {
          entries[date] = defaultEntry;
          return;
        }

        // Deep merge to ensure all properties exist
        entries[date] = {
            ...defaultEntry,
            ...existingEntry,
            meals: {
                ...defaultEntry.meals,
                // FIX: Ensure 'meals' is a non-null object before spreading to prevent crashes.
                ...(typeof existingEntry.meals === 'object' && existingEntry.meals !== null ? existingEntry.meals : {}),
            },
            tasks: defaultEntry.tasks.map((defaultTask, index) => {
                // Ensure 'tasks' is an array before trying to access its elements.
                const existingTasksArray = Array.isArray(existingEntry.tasks) ? existingEntry.tasks : [];
                const existingTask = existingTasksArray[index];
                
                // Ensure individual task is an object before spreading.
                return {
                    ...defaultTask,
                    ...(existingTask && typeof existingTask === 'object' ? existingTask : {}),
                };
            }),
            exercises: Array.isArray(existingEntry.exercises) ? existingEntry.exercises : [],
            drinks: Array.isArray(existingEntry.drinks) ? existingEntry.drinks : [],
        };
    });

    return entries;
  });
  const [habitLogs, setHabitLogs] = useState<Record<string, HabitLog[]>>(() => {
    const logs = safeJSONParse('habitLogs', {}) as any;
    if (typeof logs !== 'object' || logs === null || Array.isArray(logs)) return {} as Record<string, HabitLog[]>;
    
    // Ensure every log entry is an array of valid log objects
    Object.keys(logs).forEach(date => {
        if (!Array.isArray(logs[date])) {
            logs[date] = []; // If not an array, reset to empty array
        } else {
            // Filter out any invalid items within the array
            logs[date] = logs[date].filter((log: any) => log && typeof log === 'object' && log.habitId !== undefined && log.done !== undefined);
        }
    });
    return logs as Record<string, HabitLog[]>;
  });
  const [currentWeight, setCurrentWeightState] = useState<number | null>(() => safeJSONParse('currentWeight', null));
  const [targetWeight, setTargetWeightState] = useState<number | null>(() => safeJSONParse('targetWeight', null));
  const [height, setHeightState] = useState<number | null>(() => safeJSONParse('height', null));
  const [age, setAgeState] = useState<number | null>(() => safeJSONParse('age', null));
  const [activityLevel, setActivityLevelState] = useState<number | null>(() => safeJSONParse('activityLevel', null));

  const [religiousHabits, setReligiousHabits] = useState<ReligiousHabit[]>(() => {
    const stored = safeJSONParse('religiousHabits', INITIAL_RELIGIOUS_HABITS);
    if (!Array.isArray(stored)) {
        return INITIAL_RELIGIOUS_HABITS;
    }
    // Filter out invalid entries
    return stored.filter(h => h && typeof h === 'object' && h.id && h.name);
  });
  const [religiousHabitLogs, setReligiousHabitLogs] = useState<Record<string, ReligiousHabitLog[]>>(() => {
    const logs = safeJSONParse('religiousHabitLogs', {}) as any;
    if (typeof logs !== 'object' || logs === null || Array.isArray(logs)) return {} as Record<string, ReligiousHabitLog[]>;

    // Ensure every log entry is an array of valid log objects
    Object.keys(logs).forEach(date => {
        if (!Array.isArray(logs[date])) {
            logs[date] = []; // If not an array, reset to empty array
        } else {
            // Filter out any invalid items within the array
            logs[date] = logs[date].filter((log: any) => log && typeof log === 'object' && log.habitId !== undefined && log.count !== undefined);
        }
    });
    return logs as Record<string, ReligiousHabitLog[]>;
  });
  const [periodData, setPeriodData] = useState<PeriodData>(() => safeJSONParse('periodData', { lastPeriodStart: null, cycleLength: 28, periodLength: 5 }));

  const [customMasks, setCustomMasks] = useState<DiyMask[]>(() => safeJSONParse('customMasks', []));
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>(() => safeJSONParse('customRecipes', []));

  // Notifications State
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('dailyEntries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('habitLogs', JSON.stringify(habitLogs));
  }, [habitLogs]);

  useEffect(() => {
    if (!storageAvailable) return;
    if (currentWeight !== null) localStorage.setItem('currentWeight', JSON.stringify(currentWeight));
    else localStorage.removeItem('currentWeight');
  }, [currentWeight]);

  useEffect(() => {
      if (!storageAvailable) return;
      if (targetWeight !== null) localStorage.setItem('targetWeight', JSON.stringify(targetWeight));
      else localStorage.removeItem('targetWeight');
  }, [targetWeight]);

  useEffect(() => {
    if (!storageAvailable) return;
    if (height !== null) localStorage.setItem('height', JSON.stringify(height));
    else localStorage.removeItem('height');
  }, [height]);

  useEffect(() => {
    if (!storageAvailable) return;
    if (age !== null) localStorage.setItem('age', JSON.stringify(age));
    else localStorage.removeItem('age');
  }, [age]);

  useEffect(() => {
    if (!storageAvailable) return;
    if (activityLevel !== null) localStorage.setItem('activityLevel', JSON.stringify(activityLevel));
    else localStorage.removeItem('activityLevel');
  }, [activityLevel]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('religiousHabits', JSON.stringify(religiousHabits));
  }, [religiousHabits]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('religiousHabitLogs', JSON.stringify(religiousHabitLogs));
  }, [religiousHabitLogs]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('periodData', JSON.stringify(periodData));
  }, [periodData]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('customMasks', JSON.stringify(customMasks));
  }, [customMasks]);

  useEffect(() => {
    if (!storageAvailable) return;
    localStorage.setItem('customRecipes', JSON.stringify(customRecipes));
  }, [customRecipes]);
  
  const setUserName = (name: string) => {
    if (storageAvailable) {
      localStorage.setItem('userName', name);
    }
    setUserNameState(name);
  };
  
  const setCurrentWeight = (weight: number | null) => {
      setCurrentWeightState(weight);
      // Also log this weight to the history for today
      if (weight !== null) {
          updateStateForToday(entry => ({ ...entry, weight }));
      }
  };

  const setTargetWeight = (weight: number | null) => setTargetWeightState(weight);
  const setHeight = (val: number | null) => setHeightState(val);
  const setAge = (val: number | null) => setAgeState(val);
  const setActivityLevel = (val: number | null) => setActivityLevelState(val);

  const todayDateString = getTodayDateString();
  const todayEntry = dailyEntries[todayDateString] || createNewDailyEntry(todayDateString);

  const updateStateForToday = (updater: (entry: DailyEntry) => DailyEntry) => {
    const today = getTodayDateString();
    setDailyEntries(prev => {
      const currentEntry = prev[today] || createNewDailyEntry(today);
      return { ...prev, [today]: updater(currentEntry) };
    });
  };

  const updateMood = (mood: Mood) => {
    updateStateForToday(entry => ({ ...entry, mood }));
  };

  const updateWater = (newCount: number) => {
    updateStateForToday(entry => ({ ...entry, waterCount: newCount }));
  };

  const toggleChiaWater = () => {
    updateStateForToday(entry => ({ ...entry, chiaWater: !entry.chiaWater }));
  };

  const updateTask = (taskId: number, done: boolean) => {
    updateStateForToday(entry => ({
      ...entry,
      tasks: entry.tasks.map(t => t.id === taskId ? { ...t, done } : t),
    }));
  };
  
  const updateTaskText = (taskId: number, text: string) => {
    updateStateForToday(entry => ({
      ...entry,
      tasks: entry.tasks.map(t => t.id === taskId ? { ...t, text } : t),
    }));
  };

  const updateMeals = (newMeals: Partial<Meals>) => {
    updateStateForToday(entry => ({
      ...entry,
      meals: { ...entry.meals, ...newMeals },
    }));
  };

  const updateNotes = (notes: string) => {
    updateStateForToday(entry => ({ ...entry, notes }));
  };
  
  const updateJournal = (text: string, image?: string) => {
    updateStateForToday(entry => ({
      ...entry,
      journal: text,
      journalImage: image || entry.journalImage,
    }));
  };

  const logHabit = (habitId: string, done: boolean) => {
    const today = getTodayDateString();
    const habit = habits.find(h => h.id === habitId);

    setHabitLogs(prev => {
      const todayLogs = prev[today] || [];
      const existingLogIndex = todayLogs.findIndex(log => log.habitId === habitId);
      let newLogsForToday;

      if (habit?.type === 'weekly') {
        if (done) {
          if (existingLogIndex === -1) {
            newLogsForToday = [...todayLogs, { date: today, habitId, done: true }];
          } else {
            newLogsForToday = todayLogs.map((log, index) => index === existingLogIndex ? { ...log, done: true } : log);
          }
        } else {
          newLogsForToday = todayLogs.filter((_, index) => index !== existingLogIndex);
        }
      } else {
        if (existingLogIndex > -1) {
          newLogsForToday = todayLogs.map((log, index) => index === existingLogIndex ? { ...log, done } : log);
        } else {
          newLogsForToday = [...todayLogs, { date: today, habitId, done }];
        }
      }

      const newLogs = { ...prev };
      if (newLogsForToday && newLogsForToday.length > 0) {
        newLogs[today] = newLogsForToday;
      } else {
        delete newLogs[today];
      }
      return newLogs;
    });
  };

  const getHabitLogForToday = (habitId: string) => {
    const today = getTodayDateString();
    return (habitLogs[today] || []).find(log => log.habitId === habitId);
  };
  
  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habit,
      id: new Date().getTime().toString(),
      createdAt: new Date().toISOString(),
    };
    setHabits(prev => [...prev, newHabit]);
  };

  const updateReligiousHabitCount = (habitId: string, count: number) => {
    const today = getTodayDateString();
    setReligiousHabitLogs(prev => {
      const todayLogs = prev[today] || [];
      const existingLogIndex = todayLogs.findIndex(log => log.habitId === habitId);
      let newLogsForToday;
      const safeCount = Math.max(0, count);

      if (existingLogIndex > -1) {
        if (safeCount > 0) {
          newLogsForToday = todayLogs.map((log, index) => 
            index === existingLogIndex ? { ...log, count: safeCount } : log
          );
        } else {
          newLogsForToday = todayLogs.filter((_, index) => index !== existingLogIndex);
        }
      } else if (safeCount > 0) {
        newLogsForToday = [...todayLogs, { date: today, habitId, count: safeCount }];
      } else {
        newLogsForToday = todayLogs;
      }
      
      return { ...prev, [today]: newLogsForToday };
    });
  };
  
  const addReligiousHabit = (habit: Omit<ReligiousHabit, 'id'>) => {
    const newHabit: ReligiousHabit = {
      ...habit,
      id: `r_${new Date().getTime().toString()}`,
    };
    setReligiousHabits(prev => [...prev, newHabit]);
  };

  const getReligiousHabitLogForToday = (habitId: string) => {
    const today = getTodayDateString();
    return (religiousHabitLogs[today] || []).find(log => log.habitId === habitId);
  };

  const updatePeriodData = (data: Partial<PeriodData>) => {
    setPeriodData(prev => ({ ...prev, ...data }));
  };

  const addCustomMask = (mask: DiyMask) => {
      setCustomMasks(prev => [...prev, { ...mask, id: Date.now().toString(), isCustom: true }]);
  };
  
  const addCustomRecipe = (recipe: Recipe) => {
      setCustomRecipes(prev => [...prev, { ...recipe, id: `custom_${Date.now()}`, isCustom: true }]);
  };

  const exportData = () => {
    const data = {
      userName,
      habits,
      dailyEntries,
      habitLogs,
      currentWeight,
      targetWeight,
      religiousHabits,
      religiousHabitLogs,
      periodData,
      customMasks,
      customRecipes
    };
    return JSON.stringify(data, null, 2);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      // Basic check to ensure it's our data
      if (!data.dailyEntries && !data.habits) {
        throw new Error("Invalid data format");
      }
      
      if (data.userName) setUserNameState(data.userName);
      if (data.habits) setHabits(data.habits);
      if (data.dailyEntries) setDailyEntries(data.dailyEntries);
      if (data.habitLogs) setHabitLogs(data.habitLogs);
      if (data.religiousHabits) setReligiousHabits(data.religiousHabits);
      if (data.religiousHabitLogs) setReligiousHabitLogs(data.religiousHabitLogs);
      if (data.currentWeight !== undefined) setCurrentWeightState(data.currentWeight);
      if (data.targetWeight !== undefined) setTargetWeightState(data.targetWeight);
      if (data.periodData) setPeriodData(data.periodData);
      if (data.customMasks) setCustomMasks(data.customMasks);
      if (data.customRecipes) setCustomRecipes(data.customRecipes);

      // Save to local storage immediately to ensure persistence
      if (storageAvailable) {
         if(data.userName) localStorage.setItem('userName', data.userName);
         if(data.habits) localStorage.setItem('habits', JSON.stringify(data.habits));
         if(data.dailyEntries) localStorage.setItem('dailyEntries', JSON.stringify(data.dailyEntries));
         if(data.habitLogs) localStorage.setItem('habitLogs', JSON.stringify(data.habitLogs));
         if(data.religiousHabits) localStorage.setItem('religiousHabits', JSON.stringify(data.religiousHabits));
         if(data.religiousHabitLogs) localStorage.setItem('religiousHabitLogs', JSON.stringify(data.religiousHabitLogs));
         if(data.currentWeight !== undefined) localStorage.setItem('currentWeight', JSON.stringify(data.currentWeight));
         if(data.targetWeight !== undefined) localStorage.setItem('targetWeight', JSON.stringify(data.targetWeight));
         if(data.periodData) localStorage.setItem('periodData', JSON.stringify(data.periodData));
         if(data.customMasks) localStorage.setItem('customMasks', JSON.stringify(data.customMasks));
         if(data.customRecipes) localStorage.setItem('customRecipes', JSON.stringify(data.customRecipes));
      }
      
      return true;
    } catch (error) {
      console.error("Failed to import data", error);
      return false;
    }
  };

  const requestNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert("عذراً، متصفحك لا يدعم الإشعارات.");
      return;
    }
    Notification.requestPermission().then((permission) => {
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
         new Notification("دفتر عاداتي", { body: "تم تفعيل الإشعارات بنجاح! 🎉" });
      }
    });
  };

  // Reminder Loop
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const today = getTodayDateString();
      const todayLogs = habitLogs[today] || [];

      habits.forEach(habit => {
        if (habit.reminderTime === currentTime) {
           // Check if already done today
           const isDone = todayLogs.some(log => log.habitId === habit.id && log.done);
           if (!isDone) {
             new Notification("تذكير بعادة", { 
                 body: `حان وقت: ${habit.name} ${habit.icon}`,
                 icon: '/favicon.ico' // Assuming default icon or none
             });
           }
        }
      });
    };

    // Check every minute
    const intervalId = setInterval(checkReminders, 60000);
    // Also check immediately on mount/state change just in case (optional, but good for testing)
    // checkReminders(); 

    return () => clearInterval(intervalId);
  }, [notificationsEnabled, habits, habitLogs]);

  const addExercise = (name: string, duration: number, calories: number) => {
     updateStateForToday(entry => ({
        ...entry,
        exercises: [...(entry.exercises || []), { id: Date.now().toString(), name, durationMinutes: duration, caloriesBurned: calories }]
     }));
  };

  const deleteExercise = (id: string) => {
      updateStateForToday(entry => ({
          ...entry,
          exercises: (entry.exercises || []).filter(e => e.id !== id)
      }));
  };

  const addDrink = (name: string, icon: string, type: 'hot' | 'cold' | 'femininity') => {
    updateStateForToday(entry => {
        const now = new Date();
        const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return {
            ...entry,
            drinks: [...(entry.drinks || []), { id: Date.now().toString(), name, icon, type, timestamp }]
        };
    });
  };

  const deleteDrink = (id: string) => {
      updateStateForToday(entry => ({
          ...entry,
          drinks: (entry.drinks || []).filter(d => d.id !== id)
      }));
  };


  const value: HabitContextType = {
    userName,
    setUserName,
    habits,
    dailyEntries,
    habitLogs,
    todayEntry,
    updateMood,
    updateWater,
    toggleChiaWater,
    updateTask,
    updateTaskText,
    updateMeals,
    updateNotes,
    logHabit,
    getHabitLogForToday,
    addHabit,
    updateJournal,
    currentWeight,
    targetWeight,
    setCurrentWeight,
    setTargetWeight,
    height,
    age,
    activityLevel,
    setHeight,
    setAge,
    setActivityLevel,
    religiousHabits,
    addReligiousHabit,
    religiousHabitLogs,
    updateReligiousHabitCount,
    getReligiousHabitLogForToday,
    exportData,
    importData,
    requestNotificationPermission,
    notificationsEnabled,
    addExercise,
    deleteExercise,
    addDrink,
    deleteDrink,
    periodData,
    updatePeriodData,
    customMasks,
    addCustomMask,
    customRecipes,
    addCustomRecipe
  };

  return React.createElement(HabitContext.Provider, { value: value }, children);
};

export const useHabitStore = (): HabitContextType => {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabitStore must be used within a HabitProvider');
  }
  return context;
};
