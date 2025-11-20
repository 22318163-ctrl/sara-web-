import React, { useRef, useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS } from '../../constants';
import { Meals } from '../../types';
import { GoogleGenAI } from "@google/genai";

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};


const MealInput: React.FC<{
  label: string;
  mealKey: 'breakfast' | 'lunch' | 'dinner';
  value: string;
  image?: string;
  calories?: number;
  isLoading: boolean;
  onTextChange: (text: string) => void;
  onImageSelect: (file: File) => void;
  onCaloriesChange: (calories: number) => void;
  onCalculateFromText: () => void;
}> = ({ label, value, image, calories, isLoading, onTextChange, onImageSelect, onCaloriesChange, onCalculateFromText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-bold text-dark-green flex items-center gap-2">
            <span className="w-2 h-6 bg-pastel-green rounded-full block"></span>
            {label}
        </h3>
        {calories ? (
             <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                 <ICONS.fire className="w-3 h-3" />
                 {calories} سعرة
             </span>
        ) : null}
      </div>

      <div className="flex gap-4 items-start">
        {/* Image Section */}
        <div className="w-24 h-24 shrink-0 relative group">
          {image ? (
            <div className="relative w-full h-full">
                <img src={image} alt={label} className="w-full h-full object-cover rounded-xl shadow-inner" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-1 right-1 bg-white/80 p-1 rounded-full text-dark-green shadow-sm hover:bg-white"
                >
                    <ICONS.camera className="w-4 h-4" />
                </button>
            </div>
          ) : (
            <button 
                onClick={() => fileInputRef.current?.click()} 
                className="w-full h-full bg-light-gray rounded-xl flex flex-col items-center justify-center text-dark-green/50 hover:bg-pastel-green/20 hover:text-dark-green transition-colors border-2 border-dashed border-light-green/50 hover:border-pastel-green"
            >
              <ICONS.camera className="w-8 h-8 mb-1 opacity-60" />
              <span className="text-[10px] font-bold">صور وجبتك</span>
            </button>
          )}
        </div>

        {/* Text Section */}
        <div className="w-full flex flex-col gap-2">
            <textarea
              value={value}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder={`ماذا أكلتِ على ${label.toLowerCase()}؟ (مثال: بيضتين مسلوقات، سلطة خضار...)`}
              className="w-full h-24 bg-light-gray/50 p-3 rounded-xl outline-none focus:ring-2 focus:ring-pastel-green resize-none text-sm text-dark-green placeholder-dark-green/40"
            />
        </div>
      </div>

      {/* Actions & Status */}
      <div className="mt-3 pt-3 border-t border-light-gray flex flex-col gap-2">
          {isLoading ? (
             <div className="w-full py-2 bg-light-green/20 rounded-lg flex items-center justify-center gap-2 text-dark-green text-sm animate-pulse">
                 <div className="w-4 h-4 border-2 border-dark-green border-t-transparent rounded-full animate-spin"></div>
                 <span>جاري تحليل الوجبة وحساب السعرات...</span>
             </div>
          ) : (
             <div className="flex items-center justify-between gap-2">
                 {/* Auto Calculate Button (Visible if text exists) */}
                 {value && !calories && (
                     <button 
                         onClick={onCalculateFromText}
                         className="flex-1 py-2 bg-gradient-to-r from-pastel-green/50 to-light-green/50 hover:from-pastel-green hover:to-light-green text-dark-green rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                     >
                         <span>✨</span>
                         <span>تقدير السعرات من الوصف</span>
                     </button>
                 )}

                 {/* Manual Calorie Input */}
                 <div className={`flex items-center gap-2 bg-light-gray px-3 py-1 rounded-lg ${!value && !calories ? 'flex-1' : ''}`}>
                    <ICONS.fire className={`w-4 h-4 ${calories ? 'text-orange-500' : 'text-gray-400'}`} />
                    <input 
                        type="number" 
                        value={calories || ''} 
                        onChange={(e) => onCaloriesChange(parseInt(e.target.value) || 0)}
                        placeholder="السعرات"
                        className="bg-transparent border-none w-full text-sm text-center focus:outline-none font-bold text-dark-green"
                    />
                 </div>
             </div>
          )}
          
          {/* Hint if empty */}
          {!value && !image && !calories && !isLoading && (
              <p className="text-[10px] text-center text-dark-green/40">
                  اكتبي وصفاً أو ارفعي صورة ليقوم الذكاء الاصطناعي بحساب السعرات لكِ
              </p>
          )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

const MealsView: React.FC = () => {
  const { todayEntry, updateMeals } = useHabitStore();
  const [loadingMeal, setLoadingMeal] = useState<string | null>(null);
  
  const calculateCalories = async (promptText: string, imagePart?: any) => {
      if (!process.env.API_KEY) {
        alert("مفتاح API غير موجود. يرجى التأكد من الإعدادات.");
        return 0;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const parts: any[] = [{ text: promptText }];
      if (imagePart) parts.unshift(imagePart);

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: { parts },
      });

      const caloriesText = response.text?.trim() ?? '';
      // Extract the first number found in the response
      const match = caloriesText.match(/(\d+)/);
      return match ? parseInt(match[0], 10) : 0;
  };

  const handleImageUpload = async (meal: 'breakfast' | 'lunch' | 'dinner', file: File) => {
    setLoadingMeal(meal);
    try {
      const base64Data = await blobToBase64(file);
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      };
      
      const calories = await calculateCalories(
          'أنت خبير تغذية. قم بتحليل الصورة المرفقة لوجبة طعام. احسب السعرات الحرارية التقريبية لهذه الوجبة بدقة. قدم الإجابة كرقم صحيح نهائي فقط يمثل مجموع السعرات (مثلاً: 450). لا تكتب أي نصوص أو وحدات أو شرح إضافي.', 
          imagePart
      );
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result as string;
        const imageKey = `${meal}Image` as keyof Meals;
        const calorieKey = `${meal}Calories` as keyof Meals;
        updateMeals({ 
          [imageKey]: imageDataUrl,
          [calorieKey]: calories,
        });
      };
      reader.readAsDataURL(file);

    } catch (error) {
      console.error("Error calculating calories form image:", error);
      alert("حدث خطأ أثناء تحليل الصورة. يرجى المحاولة مرة أخرى.");
    } finally {
      setLoadingMeal(null);
    }
  };

  const handleTextCalculation = async (meal: 'breakfast' | 'lunch' | 'dinner', text: string) => {
      if (!text.trim()) return;
      setLoadingMeal(meal);
      try {
          const calories = await calculateCalories(
              `أنت خبير تغذية. قم بتقدير السعرات الحرارية لهذه الوجبة بناءً على الوصف التالي: "${text}". قدم الإجابة كرقم صحيح نهائي فقط يمثل مجموع السعرات (مثلاً: 300). لا تكتب أي نصوص أو وحدات أو شرح إضافي.`
          );
          
          const calorieKey = `${meal}Calories` as keyof Meals;
          updateMeals({ [calorieKey]: calories });
      } catch (error) {
          console.error("Error calculating calories from text:", error);
          alert("حدث خطأ أثناء تقدير السعرات. يرجى المحاولة مرة أخرى.");
      } finally {
          setLoadingMeal(null);
      }
  };

  const handleMealTextChange = (meal: keyof Meals, text: string) => {
    updateMeals({ [meal]: text });
  };

  const handleCaloriesChange = (meal: string, calories: number) => {
      updateMeals({ [`${meal}Calories`]: calories });
  };

  const totalCalories = (todayEntry.meals.breakfastCalories || 0) + 
                        (todayEntry.meals.lunchCalories || 0) + 
                        (todayEntry.meals.dinnerCalories || 0);

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <header className="text-center mb-4">
        <h1 className="text-3xl font-bold text-dark-green">وجبات اليوم</h1>
        <p className="text-dark-green/60 text-sm mt-1">سجلي وجباتك وتتبعي سعراتك بذكاء 🥗</p>
      </header>

      <div className="bg-gradient-to-r from-pastel-green to-light-green p-5 rounded-2xl shadow-sm text-dark-green flex items-center justify-between">
        <div>
          <p className="font-bold text-lg">إجمالي السعرات اليوم</p>
          <p className="text-xs opacity-80">مجموع الفطور والغداء والعشاء</p>
        </div>
        <div className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
          <ICONS.fire className="w-6 h-6 text-orange-500" />
          <span className="text-2xl font-bold">{totalCalories}</span>
        </div>
      </div>

      <div className="space-y-4">
        <MealInput
          label="الفطور"
          mealKey="breakfast"
          value={todayEntry.meals.breakfast}
          image={todayEntry.meals.breakfastImage}
          calories={todayEntry.meals.breakfastCalories}
          isLoading={loadingMeal === 'breakfast'}
          onTextChange={(text) => handleMealTextChange('breakfast', text)}
          onImageSelect={(file) => handleImageUpload('breakfast', file)}
          onCaloriesChange={(cal) => handleCaloriesChange('breakfast', cal)}
          onCalculateFromText={() => handleTextCalculation('breakfast', todayEntry.meals.breakfast)}
        />
        <MealInput
          label="الغداء"
          mealKey="lunch"
          value={todayEntry.meals.lunch}
          image={todayEntry.meals.lunchImage}
          calories={todayEntry.meals.lunchCalories}
          isLoading={loadingMeal === 'lunch'}
          onTextChange={(text) => handleMealTextChange('lunch', text)}
          onImageSelect={(file) => handleImageUpload('lunch', file)}
          onCaloriesChange={(cal) => handleCaloriesChange('lunch', cal)}
          onCalculateFromText={() => handleTextCalculation('lunch', todayEntry.meals.lunch)}
        />
        <MealInput
          label="العشاء"
          mealKey="dinner"
          value={todayEntry.meals.dinner}
          image={todayEntry.meals.dinnerImage}
          calories={todayEntry.meals.dinnerCalories}
          isLoading={loadingMeal === 'dinner'}
          onTextChange={(text) => handleMealTextChange('dinner', text)}
          onImageSelect={(file) => handleImageUpload('dinner', file)}
          onCaloriesChange={(cal) => handleCaloriesChange('dinner', cal)}
          onCalculateFromText={() => handleTextCalculation('dinner', todayEntry.meals.dinner)}
        />
      </div>
    </div>
  );
};

export default MealsView;