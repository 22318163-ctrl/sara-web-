
import React, { useState } from 'react';
import { SELF_CARE_ROUTINES, DAILY_SKINCARE_ROUTINES, DIY_MASKS, HENNA_RECIPES, HENNA_COLOR_GUIDE, ICONS } from '../../constants';
import { DiyMask } from '../../types';
import { useHabitStore } from '../../hooks/useHabitStore';
import AddMaskModal from '../AddMaskModal';
import { GoogleGenAI } from "@google/genai";

const RoutineSection: React.FC<{ 
    title: string; 
    items: { name: string; icon: string; desc: string }[];
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, items, isOpen, onToggle }) => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden border border-light-green shadow-sm transition-all">
            <button 
                onClick={onToggle}
                className="w-full p-4 flex justify-between items-center bg-light-gray/30 hover:bg-light-gray/60 transition-colors"
            >
                <h3 className="text-xl font-bold text-dark-green flex items-center gap-2">
                    {title}
                </h3>
                <span className={`text-dark-green transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            
            {isOpen && (
                <div className="p-4 space-y-3 bg-white">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-light-gray hover:border-pastel-green transition-colors">
                            <span className="text-2xl mt-1">{item.icon}</span>
                            <div>
                                <p className="font-bold text-dark-green">{item.name}</p>
                                <p className="text-sm text-dark-green/70">{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const MaskCard: React.FC<{ mask: DiyMask; onClick: () => void }> = ({ mask, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white p-4 rounded-2xl shadow-sm border border-light-green flex flex-col items-center gap-2 hover:scale-105 transition-transform duration-200 hover:shadow-md h-full w-full relative"
    >
        {mask.isCustom && <span className="absolute top-2 right-2 text-xs bg-pastel-green px-1.5 rounded text-dark-green">خاص</span>}
        <span className="text-4xl mb-2">{mask.icon}</span>
        <h3 className="font-bold text-dark-green text-sm">{mask.name}</h3>
        <span className="text-[10px] bg-light-green/50 px-2 py-1 rounded-full text-dark-green/80">{mask.type}</span>
    </button>
);

const MaskModal: React.FC<{ mask: DiyMask; onClose: () => void }> = ({ mask, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-creamy rounded-2xl p-6 w-full max-w-sm shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <button onClick={onClose} className="absolute top-4 left-4 text-dark-green/60 hover:text-dark-green">
                 ✕
             </button>
             <div className="text-center mb-6">
                 <span className="text-6xl block mb-2">{mask.icon}</span>
                 <h2 className="text-2xl font-bold text-dark-green">{mask.name}</h2>
                 <p className="text-sm text-dark-green/60 mt-1">{mask.benefits}</p>
             </div>

             <div className="space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-light-green">
                     <h4 className="font-bold text-dark-green mb-2 border-b border-light-green pb-1">🥣 المكونات:</h4>
                     <ul className="list-disc list-inside text-sm text-dark-green/80 space-y-1">
                         {mask.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                     </ul>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-light-green">
                     <h4 className="font-bold text-dark-green mb-2 border-b border-light-green pb-1">📝 طريقة التحضير:</h4>
                     <p className="text-sm text-dark-green/80 leading-relaxed">{mask.preparation}</p>
                 </div>
             </div>
        </div>
    </div>
);

const SelfCareView: React.FC = () => {
    const { customMasks } = useHabitStore();
    const [activeTab, setActiveTab] = useState<'routines' | 'care' | 'masks' | 'henna'>('routines');
    const [openSection, setOpenSection] = useState<string | null>('morning');
    const [selectedMask, setSelectedMask] = useState<DiyMask | null>(null);
    const [isAddMaskOpen, setIsAddMaskOpen] = useState(false);
    
    // Henna AI State
    const [currentColor, setCurrentColor] = useState('');
    const [targetColor, setTargetColor] = useState('');
    const [hennaAdvice, setHennaAdvice] = useState<{ingredients: string, steps: string, tips: string} | null>(null);
    const [loadingHenna, setLoadingHenna] = useState(false);

    const allMasks = [...DIY_MASKS, ...customMasks];

    const handleGetHennaRecipe = async () => {
        if (!currentColor || !targetColor || !process.env.API_KEY) return;
        
        setLoadingHenna(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                أنت خبيرة تجميل وعناية بالشعر متخصصة في الحناء والأعشاب الطبيعية.
                المستخدمة لديها شعر لونه: "${currentColor}"
                وتريد الحصول على لون: "${targetColor}" باستخدام الحناء والمواد الطبيعية فقط.
                
                المطلوب:
                1. المكونات الدقيقة للخلطة (مثل الكركديه، الكركم، الكتم، القهوة، إلخ حسب اللون).
                2. طريقة العجن والتخمير.
                3. مدة وضعها على الشعر.
                
                الرد يجب أن يكون بتنسيق JSON حصراً بهذه الهيكلية:
                {
                    "ingredients": "قائمة المكونات",
                    "steps": "خطوات التحضير والتطبيق",
                    "tips": "نصائح هامة للحصول على اللون"
                }
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });
            
            const text = response.text;
            if (text) {
                setHennaAdvice(JSON.parse(text));
            }
        } catch (error) {
            console.error("Henna AI Error", error);
            alert("حدث خطأ أثناء توليد الوصفة، حاولي مرة أخرى.");
        } finally {
            setLoadingHenna(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold text-dark-green">يوم العناية الكامل</h1>
                <p className="text-dark-green/70 mt-1">"دليلك ليوم مليء بالدلال"</p>
            </header>

            {/* Tabs */}
            <div className="flex bg-white rounded-full p-1 border border-light-green shadow-sm overflow-x-auto mb-6 no-scrollbar">
                <button 
                    onClick={() => setActiveTab('routines')}
                    className={`flex-1 min-w-[70px] py-2 rounded-full font-bold transition-all duration-300 text-sm whitespace-nowrap ${activeTab === 'routines' ? 'bg-dark-green text-white shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    ☀️ روتيني
                </button>
                <button 
                    onClick={() => setActiveTab('care')}
                    className={`flex-1 min-w-[70px] py-2 rounded-full font-bold transition-all duration-300 text-sm whitespace-nowrap ${activeTab === 'care' ? 'bg-dark-green text-white shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    🧖‍♀️ العناية
                </button>
                <button 
                    onClick={() => setActiveTab('masks')}
                    className={`flex-1 min-w-[70px] py-2 rounded-full font-bold transition-all duration-300 text-sm whitespace-nowrap ${activeTab === 'masks' ? 'bg-dark-green text-white shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    🥣 ماسكات
                </button>
                <button 
                    onClick={() => setActiveTab('henna')}
                    className={`flex-1 min-w-[80px] py-2 rounded-full font-bold transition-all duration-300 text-sm whitespace-nowrap ${activeTab === 'henna' ? 'bg-dark-green text-white shadow-md' : 'text-dark-green/60 hover:bg-light-green/30'}`}
                >
                    🌿 حناء وصبغات
                </button>
            </div>

            {/* Content */}
            {activeTab === 'routines' && (
                <div className="space-y-4 animate-fade-in">
                    <RoutineSection 
                        title="☀️ الروتين الصباحي" 
                        items={DAILY_SKINCARE_ROUTINES.morning}
                        isOpen={openSection === 'morning'}
                        onToggle={() => setOpenSection(openSection === 'morning' ? null : 'morning')}
                    />
                     <RoutineSection 
                        title="🌙 الروتين المسائي" 
                        items={DAILY_SKINCARE_ROUTINES.evening}
                        isOpen={openSection === 'evening'}
                        onToggle={() => setOpenSection(openSection === 'evening' ? null : 'evening')}
                    />
                </div>
            )}

            {activeTab === 'care' && (
                <div className="space-y-4 animate-fade-in">
                    <RoutineSection 
                        title="💆‍♀️ العناية بالشعر" 
                        items={SELF_CARE_ROUTINES.hair}
                        isOpen={openSection === 'hair'}
                        onToggle={() => setOpenSection(openSection === 'hair' ? null : 'hair')}
                    />
                    <RoutineSection 
                        title="✨ العناية بالوجه" 
                        items={SELF_CARE_ROUTINES.face}
                        isOpen={openSection === 'face'}
                        onToggle={() => setOpenSection(openSection === 'face' ? null : 'face')}
                    />
                    <RoutineSection 
                        title="🧴 العناية بالجسم" 
                        items={SELF_CARE_ROUTINES.body}
                        isOpen={openSection === 'body'}
                        onToggle={() => setOpenSection(openSection === 'body' ? null : 'body')}
                    />
                </div>
            )}

            {activeTab === 'masks' && (
                <div className="animate-fade-in">
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={() => setIsAddMaskOpen(true)} 
                            className="flex items-center gap-2 bg-pastel-green text-dark-green px-4 py-2 rounded-full text-sm font-bold hover:bg-dark-green hover:text-white transition-colors shadow-sm"
                        >
                            <ICONS.plus className="w-4 h-4" />
                            إضافة ماسك
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {allMasks.map((mask, idx) => (
                            <MaskCard key={idx} mask={mask} onClick={() => setSelectedMask(mask)} />
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'henna' && (
                <div className="animate-fade-in space-y-6">
                    {/* AI Consultant Section */}
                    <div className="bg-gradient-to-br from-white to-pastel-green/20 p-5 rounded-2xl border border-pastel-green shadow-sm">
                         <h3 className="text-lg font-bold text-dark-green mb-3 flex items-center gap-2">
                            ✨ مستشارة الحناء الذكية
                        </h3>
                        <p className="text-xs text-dark-green/70 mb-4">اكتبي لون شعرك الحالي واللون الذي تحلمين به، وسأعطيكِ الوصفة الدقيقة!</p>
                        
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <label className="text-xs font-bold text-dark-green block mb-1">لون شعرك الحالي</label>
                                <input 
                                    type="text" 
                                    value={currentColor}
                                    onChange={e => setCurrentColor(e.target.value)}
                                    placeholder="أسود، بني، مصبوغ..."
                                    className="w-full bg-white p-2 rounded-lg border border-light-green text-sm outline-none focus:border-dark-green"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-dark-green block mb-1">اللون المطلوب</label>
                                <input 
                                    type="text" 
                                    value={targetColor}
                                    onChange={e => setTargetColor(e.target.value)}
                                    placeholder="أحمر، كستنائي..."
                                    className="w-full bg-white p-2 rounded-lg border border-light-green text-sm outline-none focus:border-dark-green"
                                />
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleGetHennaRecipe}
                            disabled={loadingHenna || !currentColor || !targetColor}
                            className={`w-full py-2 rounded-xl font-bold text-white text-sm transition-all flex items-center justify-center gap-2 ${loadingHenna ? 'bg-gray-400' : 'bg-dark-green hover:bg-opacity-90'}`}
                        >
                             {loadingHenna ? 'جاري تحضير الوصفة...' : 'احصلي على الوصفة'}
                        </button>
                        
                        {hennaAdvice && (
                            <div className="mt-4 bg-white p-4 rounded-xl border border-light-green animate-fade-in">
                                <h4 className="font-bold text-dark-green mb-2 border-b border-light-green pb-1">وصفة {targetColor} الخاصة بكِ:</h4>
                                <div className="space-y-3 text-sm text-dark-green/80">
                                    <div>
                                        <span className="font-bold text-soft-gold block">🥣 المكونات:</span>
                                        <p>{hennaAdvice.ingredients}</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-soft-gold block">📝 الطريقة:</span>
                                        <p>{hennaAdvice.steps}</p>
                                    </div>
                                    <div className="bg-orange-50 p-2 rounded-lg text-xs">
                                        <span className="font-bold text-orange-700 block">💡 نصيحة:</span>
                                        <p className="text-orange-800">{hennaAdvice.tips}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Static Color Guide */}
                    <div className="bg-white rounded-2xl overflow-hidden border border-light-green shadow-sm">
                        <div className="bg-pastel-green/30 p-3 border-b border-light-green">
                            <h3 className="text-lg font-bold text-dark-green flex items-center gap-2">
                                🎨 دليل الألوان العام
                            </h3>
                        </div>
                        <div className="divide-y divide-light-gray">
                            {HENNA_COLOR_GUIDE.map((guide, idx) => (
                                <div key={idx} className="p-4">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-dark-green">{guide.color}</h4>
                                        <span className="text-[10px] bg-light-gray px-2 py-1 rounded text-dark-green/60">{guide.hairColor}</span>
                                    </div>
                                    <p className="text-sm text-dark-green/80 mb-1"><span className="font-bold">المكونات:</span> {guide.ingredients}</p>
                                    <p className="text-xs text-soft-gold italic">{guide.note}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recipes */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-dark-green px-2">وصفات الحناء المجربة:</h3>
                        {HENNA_RECIPES.map((recipe, idx) => (
                            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-light-green relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-pastel-green/20 w-16 h-16 rounded-bl-full -mr-2 -mt-2"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-2xl">{recipe.icon}</span>
                                        <h4 className="font-bold text-dark-green">{recipe.name}</h4>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <p className="text-xs font-bold text-soft-gold mb-1">🥣 المقادير:</p>
                                        <ul className="grid grid-cols-2 gap-1">
                                            {recipe.ingredients.map((ing, i) => (
                                                <li key={i} className="text-xs text-dark-green/80 flex items-center gap-1">
                                                    <span className="w-1 h-1 bg-dark-green rounded-full"></span> {ing}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-soft-gold mb-1">📝 الطريقة:</p>
                                        <p className="text-xs text-dark-green/80 leading-relaxed">{recipe.preparation}</p>
                                    </div>
                                    
                                    <div className="mt-2 pt-2 border-t border-light-gray">
                                         <p className="text-xs text-dark-green font-bold">✨ {recipe.benefits}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-pastel-green/20 p-5 rounded-2xl mt-8 text-center border border-pastel-green">
                <p className="font-bold text-dark-green mb-2">نصيحة اليوم 💡</p>
                <p className="text-sm text-dark-green/80">
                    تذكري أن العناية ليست فقط بالمظهر الخارجي، خذي وقتاً للتنفس بعمق، وشرب الماء، والامتنان لجسدك الجميل.
                </p>
            </div>

            {selectedMask && <MaskModal mask={selectedMask} onClose={() => setSelectedMask(null)} />}
            {isAddMaskOpen && <AddMaskModal onClose={() => setIsAddMaskOpen(false)} />}
        </div>
    );
};

export default SelfCareView;
