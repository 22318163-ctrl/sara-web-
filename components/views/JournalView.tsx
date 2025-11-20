import React, { useRef } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ICONS } from '../../constants';

const JournalView: React.FC = () => {
  const { todayEntry, updateJournal } = useHabitStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateJournal(todayEntry.journal, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-dark-green text-center">مساحتي الخاصة</h1>
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green space-y-4">
        <textarea
          placeholder="اكتبي ما يجول في خاطرك..."
          value={todayEntry.journal}
          onChange={(e) => updateJournal(e.target.value)}
          className="w-full h-80 bg-light-gray p-3 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green resize-none text-lg leading-relaxed"
        />
        <div className="flex justify-between items-center">
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-dark-green/80 hover:text-dark-green">
                <ICONS.camera className="w-6 h-6" />
                <span>إضافة صورة</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
        </div>
        {todayEntry.journalImage && (
            <div className="mt-4">
                <img src={todayEntry.journalImage} alt="Journal entry" className="max-w-full rounded-lg" />
            </div>
        )}
      </div>
    </div>
  );
};

export default JournalView;