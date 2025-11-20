
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ICONS } from '../../constants';
import { VitaminRecommendation } from '../../types';

const VitaminsView: React.FC = () => {
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<VitaminRecommendation[]>([]);

    const handleGetAdvice = async () => {
        if (!userInput.trim() || !process.env.API_KEY) return;

        setLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
                تصرفي كأخصائية تغذية وصيدلانية خبيرة. المستخدم يريد تحسين: "${userInput}".
                اقترحي 3 فيتامينات أو مكملات غذائية مناسبة لهذه الحالة.
                لكل اقتراح، قدمي:
                1. الاسم (اسم الفيتامين أو المعدن).
                2. من الصيدلية (اسم علمي شائع للمكمل).
                3. من الطبيعة (أهم مصادر الطعام).
                4. الفائدة (لماذا يساعد في هذه الحالة).
                
                الرد يجب أن يكون بتنسيق JSON حصراً مصفوفة كائنات بهذه الهيكلية (بدون أي نص إضافي أو markdown):
                [
                  {
                    "name": "اسم الفيتامين",
                    "pharmacy": "الاسم العلمي/التجاري الشائع",
                    "natural": "المصادر الطبيعية",
                    "benefit": "الفائدة باختصار"
                  }
                ]
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const text = response.text;
            if (text) {
                const data = JSON.parse(text);
                setRecommendations(data);
            }
        } catch (error) {
            console.error("Error getting vitamin advice:", error);
            alert("حدث خطأ أثناء الحصول على النصيحة. يرجى المحاولة مرة أخرى.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <header className="text-center mb-6">
                <h1 className="text-3xl font-bold text-dark-green">فيتاميناتي 💊</h1>
                <p className="text-dark-green/70 mt-2 text-sm">دليلك الذكي للمكملات الغذائية من الطبيعة والصيدلية</p>
            </header>

            {/* Input Section */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <label className="block text-dark-green font-bold mb-2">ما الذي تريدين تحسينه؟</label>
                <textarea 
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="مثال: تساقط الشعر، قلة النشاط، شحوب البشرة، تقوية الأظافر..."
                    className="w-full h-24 bg-light-gray p-3 rounded-xl outline-none focus:ring-2 focus:ring-pastel-green resize-none text-dark-green placeholder-dark-green/40 mb-4"
                />
                <button 
                    onClick={handleGetAdvice}
                    disabled={loading || !userInput.trim()}
                    className={`w-full py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 ${
                        loading || !userInput.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-dark-green hover:bg-opacity-90 shadow-md'
                    }`}
                >
                    {loading ? (
                        <>جاري البحث... <span className="animate-spin">⏳</span></>
                    ) : (
                        <>✨ اقترحي لي فيتامينات</>
                    )}
                </button>
            </div>

            {/* Results Section */}
            {recommendations.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold text-dark-green px-2">النتائج المقترحة لكِ:</h2>
                    {recommendations.map((item, index) => (
                        <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-light-green relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-pastel-green"></div>
                            <h3 className="text-lg font-bold text-dark-green mb-3 flex items-center gap-2">
                                <span className="bg-light-green w-8 h-8 rounded-full flex items-center justify-center text-sm">
                                    {index + 1}
                                </span>
                                {item.name}
                            </h3>
                            
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-2">
                                    <span className="text-xl">💊</span>
                                    <div>
                                        <span className="font-bold text-dark-green/80 block">من الصيدلية:</span>
                                        <span className="text-dark-green/70">{item.pharmacy}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-xl">🥦</span>
                                    <div>
                                        <span className="font-bold text-dark-green/80 block">من الطبيعة:</span>
                                        <span className="text-dark-green/70">{item.natural}</span>
                                    </div>
                                </div>
                                <div className="bg-light-gray p-3 rounded-lg mt-2">
                                    <span className="font-bold text-soft-gold block mb-1">💡 الفائدة:</span>
                                    <p className="text-dark-green/80 leading-relaxed">{item.benefit}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* General Vitamins Guide (Static) */}
            {!recommendations.length && (
                <div className="mt-8">
                    <h2 className="text-xl font-bold text-dark-green mb-4 px-2">دليل الفيتامينات الأساسية</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">🍊</span>
                            <h3 className="font-bold text-dark-green">فيتامين C</h3>
                            <p className="text-xs text-dark-green/60 mt-1">للمناعة ونضارة البشرة. موجود في الحمضيات والفلفل.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">☀️</span>
                            <h3 className="font-bold text-dark-green">فيتامين D</h3>
                            <p className="text-xs text-dark-green/60 mt-1">للعظام والمزاج. المصدر الرئيسي هو الشمس والأسماك.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">🥩</span>
                            <h3 className="font-bold text-dark-green">الحديد</h3>
                            <p className="text-xs text-dark-green/60 mt-1">لمحاربة فقر الدم والتعب. في اللحوم والسبانخ.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">🐟</span>
                            <h3 className="font-bold text-dark-green">أوميغا 3</h3>
                            <p className="text-xs text-dark-green/60 mt-1">للتركيز وصحة القلب والشعر. في السمك والمكسرات.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">💅</span>
                            <h3 className="font-bold text-dark-green">البيوتين</h3>
                            <p className="text-xs text-dark-green/60 mt-1">لصحة الشعر والأظافر. موجود في البيض والمكسرات.</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-light-green hover:shadow-md transition-shadow">
                            <span className="text-3xl block mb-2">🦴</span>
                            <h3 className="font-bold text-dark-green">الكالسيوم</h3>
                            <p className="text-xs text-dark-green/60 mt-1">للعظام والأسنان. في الحليب والأجبان.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VitaminsView;
