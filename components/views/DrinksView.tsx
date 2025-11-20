
import React, { useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { SUGGESTED_DRINKS, ICONS } from '../../constants';

interface DrinkInfoModalProps {
    drink: typeof SUGGESTED_DRINKS[0];
    onClose: () => void;
    onAdd: () => void;
}

const DrinkInfoModal: React.FC<DrinkInfoModalProps> = ({ drink, onClose, onAdd }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                 <button onClick={onClose} className="absolute top-4 left-4 text-dark-green/50 hover:text-dark-green text-xl">
                    ✕
                </button>
                <div className="text-center mb-4">
                    <span className="text-6xl block mb-2">{drink.icon}</span>
                    <h3 className="text-2xl font-bold text-dark-green">{drink.name}</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                    <div className="bg-light-green/30 p-4 rounded-xl">
                        <h4 className="font-bold text-dark-green text-sm mb-1">✨ الفوائد:</h4>
                        <p className="text-dark-green/80 text-sm leading-relaxed">
                            {drink.benefits}
                        </p>
                    </div>

                    <div className="bg-light-gray p-4 rounded-xl">
                        <h4 className="font-bold text-dark-green text-sm mb-1">🥄 طريقة التحضير:</h4>
                        <p className="text-dark-green/80 text-sm leading-relaxed">
                            {drink.preparation}
                        </p>
                    </div>
                </div>

                <button 
                    onClick={onAdd}
                    className="w-full bg-dark-green text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transition-colors shadow-md"
                >
                    إضافة لسجلي
                </button>
            </div>
        </div>
    );
};

const DrinksView: React.FC = () => {
    const { todayEntry, addDrink, deleteDrink } = useHabitStore();
    const [activeTab, setActiveTab] = useState<'hot' | 'cold' | 'femininity'>('hot');
    const [selectedDrink, setSelectedDrink] = useState<typeof SUGGESTED_DRINKS[0] | null>(null);

    const filteredDrinks = SUGGESTED_DRINKS.filter(drink => drink.type === activeTab);

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'م' : 'ص';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const handleDrinkClick = (drink: typeof SUGGESTED_DRINKS[0]) => {
        setSelectedDrink(drink);
    };

    const handleConfirmAdd = () => {
        if (selectedDrink) {
            addDrink(selectedDrink.name, selectedDrink.icon, selectedDrink.type as 'hot' | 'cold' | 'femininity');
            setSelectedDrink(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24 relative">
            <h1 className="text-3xl font-bold text-dark-green">مشروباتي</h1>

            {/* Tabs */}
            <div className="flex bg-white rounded-full p-1 border border-light-green shadow-sm overflow-hidden">
                <button 
                    onClick={() => setActiveTab('hot')}
                    className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-1 text-sm sm:text-base ${activeTab === 'hot' ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    <span>☕</span>
                    دافئة
                </button>
                <button 
                    onClick={() => setActiveTab('cold')}
                    className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-1 text-sm sm:text-base ${activeTab === 'cold' ? 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    <span>🧊</span>
                    باردة
                </button>
                <button 
                    onClick={() => setActiveTab('femininity')}
                    className={`flex-1 py-2 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-1 text-sm sm:text-base ${activeTab === 'femininity' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    <span>🌸</span>
                    أنوثة
                </button>
            </div>

            {/* Drinks Grid */}
            <div className="grid grid-cols-3 gap-3">
                {filteredDrinks.map((drink, index) => (
                    <button 
                        key={index}
                        onClick={() => handleDrinkClick(drink)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-light-green flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200 hover:shadow-md"
                    >
                        <span className="text-4xl mb-1">{drink.icon}</span>
                        <span className="text-xs font-bold text-dark-green text-center">{drink.name}</span>
                    </button>
                ))}
            </div>

            {/* Log Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <h2 className="text-xl font-bold text-dark-green mb-4 flex items-center gap-2">
                    <ICONS.drinks className="w-6 h-6 text-soft-gold" />
                    سجل اليوم
                </h2>
                
                {(todayEntry.drinks || []).length > 0 ? (
                    <div className="space-y-3">
                        {todayEntry.drinks.map(drink => (
                            <div key={drink.id} className="flex items-center justify-between bg-light-gray/50 p-3 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm">
                                        {drink.icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-dark-green text-sm">{drink.name}</p>
                                        <p className="text-xs text-dark-green/50">{formatTime(drink.timestamp)}</p>
                                    </div>
                                </div>
                                <button onClick={() => deleteDrink(drink.id)} className="text-red-400 hover:text-red-600 p-2">
                                    <ICONS.trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-dark-green/40">
                        <p className="text-4xl mb-2 opacity-50">🍵</p>
                        <p>لم تسجلي أي مشروبات اليوم</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {selectedDrink && (
                <DrinkInfoModal 
                    drink={selectedDrink} 
                    onClose={() => setSelectedDrink(null)} 
                    onAdd={handleConfirmAdd} 
                />
            )}
        </div>
    );
};

export default DrinksView;
