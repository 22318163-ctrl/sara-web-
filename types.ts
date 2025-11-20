
export type Page = 'today' | 'habits' | 'mood' | 'meals' | 'journal' | 'monthly' | 'religious' | 'azkar-morning' | 'azkar-evening' | 'azkar-sleep' | 'sports' | 'drinks' | 'period' | 'self-care' | 'weight' | 'vitamins' | 'meals-log' | 'recipes';

export interface Habit {
  id: string;
  name: string;
  icon: string;
  goal: string;
  type: 'daily' | 'weekly' | 'custom';
  weeklyGoal?: number; // e.g., 3 for "3 times a week"
  reminderTime?: string; // Format: "HH:MM" (24h)
  accentColor: string;
  createdAt: string;
}

export interface Task {
  id: number;
  text: string;
  done: boolean;
}

export interface Meals {
  breakfast: string;
  lunch: string;
  dinner: string;
  breakfastImage?: string;
  lunchImage?: string;
  dinnerImage?: string;
  breakfastCalories?: number;
  lunchCalories?: number;
  dinnerCalories?: number;
}

export interface Exercise {
  id: string;
  name: string;
  durationMinutes: number;
  caloriesBurned: number;
}

export interface DrinkLog {
    id: string;
    name: string;
    type: 'hot' | 'cold' | 'femininity';
    icon: string;
    timestamp: string; // HH:MM
}

export type Mood = '😍' | '😊' | '😐' | '😟' | '😭' | '😡' | null;

export interface DailyEntry {
  date: string; // YYYY-MM-DD
  mood: Mood;
  waterCount: number;
  chiaWater: boolean; // New field for Chia Water
  meals: Meals;
  tasks: Task[];
  exercises: Exercise[];
  drinks: DrinkLog[];
  notes: string;
  journal: string;
  journalImage?: string;
  weight?: number;
}

export interface HabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  done: boolean;
}

export interface ReligiousHabit {
  id: string;
  name: string;
  icon: string;
  hasCounter?: boolean;
}

export interface ReligiousHabitLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  count: number;
}

export interface ZikrItem {
  text: string;
  count: number;
  note?: string;
}

export interface PeriodData {
  lastPeriodStart: string | null; // YYYY-MM-DD
  cycleLength: number; // default 28
  periodLength: number; // default 5
}

export interface DiyMask {
  id?: string; // Added optional ID for custom masks
  name: string;
  icon: string;
  type: 'وجه' | 'شعر' | 'جسم';
  ingredients: string[];
  preparation: string;
  benefits: string;
  isCustom?: boolean;
}

export interface DietPlan {
  type: 'weight-loss' | 'maintenance' | 'weight-gain';
  title: string;
  calories: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
  snacks: string[];
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  time: string; // e.g., "20 دقيقة"
  image?: string;
  ingredients: string[];
  steps: string[];
  tags: string[]; // e.g., 'فطور', 'غداء'
  isCustom?: boolean;
}

export interface VitaminRecommendation {
  name: string;
  pharmacy: string;
  natural: string;
  benefit: string;
}
