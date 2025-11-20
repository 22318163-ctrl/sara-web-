
import React, { useState } from 'react';
import { useHabitStore } from '../hooks/useHabitStore';
import { DiyMask } from '../types';

interface AddMaskModalProps {
  onClose: () => void;
}

const AddMaskModal: React.FC<AddMaskModalProps> = ({ onClose }) => {
  const { addCustomMask } = useHabitStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧖‍♀️');
  const [type, setType] = useState<'وجه' | 'شعر' | 'جسم'>('وجه');
  const [ingredients, setIngredients] = useState('');
  const [preparation, setPreparation] = useState('');
  const [benefits, setBenefits] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newMask: DiyMask = {
        name,
        icon,
        type,
        ingredients: ingredients.split('\n').filter(line => line.trim() !== ''),
        preparation,
        benefits,
        isCustom: true
    };

    addCustomMask(newMask);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-creamy rounded-2xl p-6 w-full max-w-sm shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-green mb-4 text-center">إضافة ماسك خاص</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
             <input type="text" value={icon} onChange={e => setIcon(e.target.value)} className="w-14 text-center p-2 rounded-lg bg-white border border-light-green" placeholder="رمز" />
             <input type="text" value={name} onChange={e => setName(e.target.value)} className="flex-1 p-2 rounded-lg bg-white border border-light-green" placeholder="اسم الماسك" required />
          </div>
          
          <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 rounded-lg bg-white border border-light-green">
              <option value="وجه">وجه</option>
              <option value="شعر">شعر</option>
              <option value="جسم">جسم</option>
          </select>

          <textarea 
            value={ingredients} 
            onChange={e => setIngredients(e.target.value)} 
            className="w-full p-2 rounded-lg bg-white border border-light-green h-20" 
            placeholder="المكونات (كل مكون في سطر)"
          />

          <textarea 
            value={preparation} 
            onChange={e => setPreparation(e.target.value)} 
            className="w-full p-2 rounded-lg bg-white border border-light-green h-20" 
            placeholder="طريقة التحضير..."
          />

          <input 
            type="text" 
            value={benefits} 
            onChange={e => setBenefits(e.target.value)} 
            className="w-full p-2 rounded-lg bg-white border border-light-green" 
            placeholder="الفوائد (اختياري)" 
          />

          <button type="submit" className="w-full bg-dark-green text-white py-2 rounded-xl font-bold mt-4">حفظ</button>
        </form>
      </div>
    </div>
  );
};

export default AddMaskModal;
