import React, { useState } from 'react';
import { useHabitStore } from '../hooks/useHabitStore';
import { ReligiousHabit } from '../types';

interface AddReligiousHabitModalProps {
  onClose: () => void;
}

const AddReligiousHabitModal: React.FC<AddReligiousHabitModalProps> = ({ onClose }) => {
  const { addReligiousHabit } = useHabitStore();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🕌');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const newHabit: Omit<ReligiousHabit, 'id'> = {
      name,
      icon,
    };
    
    addReligiousHabit(newHabit);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-creamy rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-dark-green mb-6 text-center">إضافة عادة دينية</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value.slice(0, 2))}
                className="w-16 text-center text-2xl bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"
                placeholder="أيقونة"
              />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green"
                placeholder="اسم العادة (مثال: دعاء)"
                required
              />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-full text-dark-green">
              إلغاء
            </button>
            <button type="submit" className="px-6 py-2 rounded-full bg-dark-green text-white font-bold">
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddReligiousHabitModal;
