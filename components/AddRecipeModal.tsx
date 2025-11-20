
import React, { useState, useRef } from 'react';
import { useHabitStore } from '../hooks/useHabitStore';
import { Recipe } from '../types';
import { ICONS } from '../constants';

interface AddRecipeModalProps {
  onClose: () => void;
}

const AddRecipeModal: React.FC<AddRecipeModalProps> = ({ onClose }) => {
  const { addCustomRecipe } = useHabitStore();
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number>(0);
  const [time, setTime] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [steps, setSteps] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newRecipe: Recipe = {
        id: `temp_${Date.now()}`, // Will be overwritten by store
        name,
        calories,
        time,
        ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
        steps: steps.split('\n').filter(line => line.trim() !== ''),
        tags: ['وصفة خاصة'],
        image,
        isCustom: true
    };

    addCustomRecipe(newRecipe);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-creamy rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-green mb-4 text-center">إضافة وصفة جديدة</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          
          {/* Image Upload */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-32 bg-white border-2 border-dashed border-light-green rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-light-green/10 transition-colors relative overflow-hidden"
          >
             {image ? (
                 <img src={image} alt="preview" className="w-full h-full object-cover" />
             ) : (
                 <>
                    <ICONS.camera className="w-8 h-8 text-dark-green/40 mb-2" />
                    <span className="text-xs text-dark-green/60">أضيفي صورة للطبق</span>
                 </>
             )}
             <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg bg-white border border-light-green outline-none" placeholder="اسم الوصفة" required />
          
          <div className="flex gap-2">
             <input type="number" value={calories || ''} onChange={e => setCalories(parseInt(e.target.value))} className="w-1/2 p-2 rounded-lg bg-white border border-light-green outline-none" placeholder="السعرات" />
             <input type="text" value={time} onChange={e => setTime(e.target.value)} className="w-1/2 p-2 rounded-lg bg-white border border-light-green outline-none" placeholder="وقت التحضير" />
          </div>

          <textarea 
            value={ingredients} 
            onChange={e => setIngredients(e.target.value)} 
            className="w-full p-2 rounded-lg bg-white border border-light-green h-20 outline-none" 
            placeholder="المكونات (كل مكون في سطر)"
          />

          <textarea 
            value={steps} 
            onChange={e => setSteps(e.target.value)} 
            className="w-full p-2 rounded-lg bg-white border border-light-green h-20 outline-none" 
            placeholder="طريقة التحضير (كل خطوة في سطر)"
          />

          <button type="submit" className="w-full bg-dark-green text-white py-2 rounded-xl font-bold mt-4 hover:bg-opacity-90 transition-colors">حفظ الوصفة</button>
        </form>
      </div>
    </div>
  );
};

export default AddRecipeModal;
