
import React, { useMemo, useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { ACTIVITY_LEVELS, FAT_BURNING_DRINKS, DIET_PLANS, ICONS } from '../../constants';
import { DietPlan } from '../../types';
import { GoogleGenAI } from "@google/genai";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const WeightView: React.FC = () => {
    const { 
        currentWeight, targetWeight, height, age, activityLevel, 
        setCurrentWeight, setTargetWeight, setHeight, setAge, setActivityLevel, dailyEntries
    } = useHabitStore();

    const [generatedPlan, setGeneratedPlan] = useState<DietPlan | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Prepare Chart Data
    const weightHistory = useMemo(() => {
        const data = Object.values(dailyEntries)
            .filter(entry => entry.weight !== undefined && entry.weight > 0)
            .map(entry => ({
                date: entry.date,
                weight: entry.weight,
                formattedDate: new Date(entry.date).toLocaleDateString('ar-EG', { month: 'numeric', day: 'numeric' })
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-30); // Show last 30 entries

        return data;
    }, [dailyEntries]);

    // Calculations
    const stats = useMemo(() => {
        if (!currentWeight || !height || !age || !activityLevel) return null;

        // BMR Calculation (Mifflin-St Jeor Equation for Women)
        const bmr = (10 * currentWeight) + (6.25 * height) - (5 * age) - 161;
        
        // TDEE (Total Daily Energy Expenditure)
        const tdee = bmr * activityLevel;

        // Goal Calories
        let targetCalories = tdee;
        let planType: DietPlan['type'] = 'maintenance';
        let goalText = "الحفاظ على الوزن";

        if (targetWeight) {
            if (targetWeight < currentWeight) {
                targetCalories = tdee - 500; // Deficit for weight loss
                planType = 'weight-loss';
                goalText = "إنقاص الوزن";
            } else if (targetWeight > currentWeight) {
                targetCalories = tdee + 300; // Surplus for weight gain
                planType = 'weight-gain';
                goalText = "زيادة الوزن";
            }
        }

        // BMI Calculation
        const heightInMeters = height / 100;
        const bmi = currentWeight / (heightInMeters * heightInMeters);
        let bmiStatus = '';
        let bmiColor = '';

        if (bmi < 18.5) { bmiStatus = 'نحافة'; bmiColor = 'text-blue-500'; }
        else if (bmi < 24.9) { bmiStatus = 'وزن مثالي'; bmiColor = 'text-green-500'; }
        else if (bmi < 29.9) { bmiStatus = 'وزن زائد'; bmiColor = 'text-orange-500'; }
        else { bmiStatus = 'سمنة'; bmiColor = 'text-red-500'; }

        return { bmr, tdee, targetCalories, bmi, bmiStatus, bmiColor, planType, goalText };
    }, [currentWeight, targetWeight, height, age, activityLevel]);

    const staticPlan = stats ? DIET_PLANS.find(p => p.type === stats.planType) : null;
    const displayPlan = generatedPlan || staticPlan;

    const handleGenerateAIPlan = async () => {
        if (!stats || !process.env.API_KEY) return;
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const prompt = `
                أنتِ أخصائية تغذية محترفة. قومي بإنشاء خطة وجبات ليوم واحد مخصصة لامرأة عربية بناءً على البيانات التالية:
                الوزن الحالي: ${currentWeight} كجم
                الطول: ${height} سم
                العمر: ${age} سنة
                مؤشر كتلة الجسم (BMI): ${stats.bmi.toFixed(1)} (${stats.bmiStatus})
                الهدف: ${stats.goalText}
                السعرات الحرارية المستهدفة: ${Math.round(stats.targetCalories)} سعرة حرارية.
                
                المطلوب:
                1. اقترحي وجبات متنوعة وصحية (فطور، غداء، عشاء، سناك).
                2. استخدمي أكلات متوفرة في المطبخ العربي، صحية ولذيذة.
                3. الرد يجب أن يكون بتنسيق JSON حصراً بهذه الهيكلية (بدون أي نص إضافي أو markdown):
                {
                    "title": "خطة ذكية مخصصة لكِ",
                    "calories": "${Math.round(stats.targetCalories)} سعرة تقريباً",
                    "type": "${stats.planType}",
                    "breakfast": ["خيار 1", "خيار 2"],
                    "lunch": ["خيار 1", "خيار 2"],
                    "dinner": ["خيار 1", "خيار 2"],
                    "snacks": ["خيار 1", "خيار 2"]
                }
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: { responseMimeType: 'application/json' }
            });

            const jsonText = response.text;
            if (jsonText) {
                const plan = JSON.parse(jsonText);
                setGeneratedPlan(plan);
            }
        } catch (error) {
            console.error("Error generating diet plan:", error);
            alert("عذراً، حدث خطأ أثناء توليد الخطة. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <h1 className="text-3xl font-bold text-dark-green text-center">رشاقتي 🏃‍♀️</h1>

            {/* Inputs Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green space-y-4">
                <h2 className="font-bold text-dark-green mb-2">بيانات جسمك</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-dark-green/70 mb-1">الوزن (كجم)</label>
                        <input 
                            type="number" 
                            value={currentWeight || ''}
                            onChange={(e) => setCurrentWeight(parseFloat(e.target.value))}
                            className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-dark-green/70 mb-1">الهدف (كجم)</label>
                        <input 
                            type="number" 
                            value={targetWeight || ''}
                            onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                            className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-dark-green/70 mb-1">الطول (سم)</label>
                        <input 
                            type="number" 
                            value={height || ''}
                            onChange={(e) => setHeight(parseFloat(e.target.value))}
                            className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-dark-green/70 mb-1">العمر</label>
                        <input 
                            type="number" 
                            value={age || ''}
                            onChange={(e) => setAge(parseFloat(e.target.value))}
                            className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-center"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs text-dark-green/70 mb-1">مستوى النشاط</label>
                    <select 
                        value={activityLevel || ''} 
                        onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                        className="w-full bg-light-gray p-2 rounded-lg outline-none focus:ring-2 focus:ring-pastel-green text-sm"
                    >
                        <option value="" disabled>اختاري مستوى نشاطك</option>
                        {ACTIVITY_LEVELS.map(level => (
                            <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Weight Chart */}
            {weightHistory.length > 1 && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-light-green">
                    <h2 className="font-bold text-dark-green mb-4 flex items-center gap-2 text-sm">
                        <span className="text-lg">📈</span> تطور الوزن
                    </h2>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer>
                            <LineChart data={weightHistory} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                                <XAxis 
                                    dataKey="formattedDate" 
                                    tick={{ fill: '#4A7A5A', fontSize: 10 }} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis 
                                    domain={['dataMin - 2', 'dataMax + 2']} 
                                    tick={{ fill: '#4A7A5A', fontSize: 10 }} 
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#F6F2EC', borderColor: '#BFD8C8', borderRadius: '8px', fontSize: '12px', color: '#4A7A5A' }}
                                    labelStyle={{ display: 'none' }}
                                />
                                {targetWeight && (
                                    <ReferenceLine y={targetWeight} stroke="#D9C5A3" strokeDasharray="3 3" />
                                )}
                                <Line 
                                    type="monotone" 
                                    dataKey="weight" 
                                    stroke="#4A7A5A" 
                                    strokeWidth={2} 
                                    dot={{ fill: '#BFD8C8', r: 4, strokeWidth: 0 }}
                                    activeDot={{ r: 6, fill: '#4A7A5A' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Results Section */}
            {stats ? (
                <>
                    <div className="bg-gradient-to-r from-pastel-green to-light-green p-5 rounded-2xl shadow-sm text-dark-green">
                        <h2 className="font-bold text-lg mb-4 text-center border-b border-dark-green/20 pb-2">تحليل حالتك</h2>
                        <div className="flex justify-around text-center mb-4">
                            <div>
                                <p className="text-xs opacity-80">مؤشر الكتلة (BMI)</p>
                                <p className={`text-2xl font-bold ${stats.bmiColor}`}>{stats.bmi.toFixed(1)}</p>
                                <p className={`text-xs font-bold ${stats.bmiColor}`}>{stats.bmiStatus}</p>
                            </div>
                            <div className="w-px bg-dark-green/20"></div>
                            <div>
                                <p className="text-xs opacity-80">احتياجك اليومي</p>
                                <p className="text-2xl font-bold">{Math.round(stats.targetCalories)}</p>
                                <p className="text-xs">سعرة حرارية</p>
                            </div>
                        </div>
                        <p className="text-center text-sm bg-white/40 p-2 rounded-lg">
                            للوصول لهدفك {targetWeight} كجم ({stats.goalText})، حاولي الالتزام بـ <b>{Math.round(stats.targetCalories)}</b> سعرة يومياً.
                        </p>
                    </div>

                    {/* Generate AI Plan Button */}
                    <button 
                        onClick={handleGenerateAIPlan}
                        disabled={isGenerating}
                        className={`w-full py-4 rounded-2xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 ${
                            isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-dark-green to-pastel-green hover:shadow-lg'
                        }`}
                    >
                        {isGenerating ? (
                            <>جاري تصميم الخطة... <span className="animate-spin">⏳</span></>
                        ) : (
                            <>✨ صممي لي خطة ذكية مخصصة</>
                        )}
                    </button>

                    {/* Meal Suggestions */}
                    {displayPlan && (
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green animate-fade-in">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="font-bold text-dark-green flex items-center gap-2">
                                    <span className="text-xl">🍽️</span>
                                    {displayPlan.title}
                                </h2>
                                {generatedPlan && <span className="text-xs bg-soft-gold/20 text-dark-green px-2 py-1 rounded-full">مخصص بالذكاء الاصطناعي</span>}
                            </div>
                            
                            <div className="space-y-3 text-sm">
                                <div className="bg-light-gray/50 p-3 rounded-lg">
                                    <span className="font-bold text-soft-gold block mb-1">الفطور:</span>
                                    <ul className="list-disc list-inside text-dark-green/80 space-y-1">{displayPlan.breakfast.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                </div>
                                <div className="bg-light-gray/50 p-3 rounded-lg">
                                    <span className="font-bold text-soft-gold block mb-1">الغداء:</span>
                                    <ul className="list-disc list-inside text-dark-green/80 space-y-1">{displayPlan.lunch.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                </div>
                                <div className="bg-light-gray/50 p-3 rounded-lg">
                                    <span className="font-bold text-soft-gold block mb-1">العشاء:</span>
                                    <ul className="list-disc list-inside text-dark-green/80 space-y-1">{displayPlan.dinner.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                </div>
                                <div className="bg-light-gray/50 p-3 rounded-lg">
                                    <span className="font-bold text-soft-gold block mb-1">سناك:</span>
                                    <ul className="list-disc list-inside text-dark-green/80 space-y-1">{displayPlan.snacks.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-6 text-dark-green/60 bg-white/50 rounded-xl border border-dashed border-pastel-green">
                    أدخلي بياناتك (الوزن، الطول، العمر، النشاط) لعرض التحليل والخطة المقترحة 📝
                </div>
            )}

            {/* Fat Burning Drinks */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-light-green">
                <h2 className="font-bold text-dark-green mb-4 flex items-center gap-2">
                    <ICONS.fire className="w-6 h-6 text-orange-500" />
                    مشروبات لرفع الحرق
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    {FAT_BURNING_DRINKS.map((drink, idx) => (
                        <div key={idx} className="bg-light-gray p-3 rounded-xl text-center">
                            <span className="text-2xl block mb-1">{drink.icon}</span>
                            <p className="font-bold text-dark-green text-xs mb-1">{drink.name}</p>
                            <p className="text-[10px] text-dark-green/60 leading-tight">{drink.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default WeightView;
