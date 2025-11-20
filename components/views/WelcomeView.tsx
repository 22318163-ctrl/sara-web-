
import React, { useState } from 'react';
import { useHabitStore } from '../../hooks/useHabitStore';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { ICONS } from '../../constants';

const WelcomeView: React.FC = () => {
  const { setUserName } = useHabitStore();
  const [name, setName] = useState('');
  const { deferredPrompt, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setUserName(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-creamy flex flex-col items-center justify-center p-4 text-center animate-fade-in">
      <div className="max-w-md w-full">
        <span className="text-6xl" role="img" aria-label="leaf">🌿</span>
        <h1 className="text-4xl font-bold text-dark-green mt-4">أهلاً بكِ في تطبيق ساره</h1>
        <p className="text-dark-green/70 mt-2 text-lg">ابدأي رحلة العادات بلطف — خطوة بخطوة</p>

        <form onSubmit={handleSubmit} className="mt-10">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-white text-lg text-center p-4 rounded-full outline-none focus:ring-2 focus:ring-pastel-green"
            placeholder="اكتبي اسمك هنا..."
            required
            autoFocus
          />
          <button
            type="submit"
            className="mt-6 w-full px-8 py-4 bg-dark-green text-white font-bold rounded-full text-lg shadow-lg hover:bg-pastel-green hover:text-dark-green transition-colors duration-300"
          >
            ابدأي رحلتك
          </button>
        </form>

        {/* Install App Section - Visible only if not installed */}
        {!isStandalone && (
            <div className="mt-10 bg-white/50 backdrop-blur-sm p-5 rounded-3xl border border-light-green shadow-sm">
                <h3 className="font-bold text-dark-green mb-2 text-lg">حملي التطبيق الآن 📲</h3>
                <p className="text-dark-green/70 text-sm mb-4">
                    لأفضل تجربة وضمان حفظ بياناتك، يفضل تثبيت التطبيق على جوالك.
                </p>

                {(deferredPrompt || isIOS) ? (
                    <>
                        {isIOS ? (
                            <div>
                                <button
                                    onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                                    className="w-full bg-white text-dark-green py-3 rounded-xl hover:bg-dark-green hover:text-white transition-colors font-bold text-sm shadow-sm border border-light-green"
                                >
                                    {showIOSInstructions ? 'إخفاء التعليمات' : 'طريقة التثبيت على الآيفون'}
                                </button>
                                {showIOSInstructions && (
                                    <div className="mt-3 text-sm text-dark-green/80 space-y-2 bg-white p-3 rounded-xl text-right">
                                        <p className="flex items-center gap-2 justify-end">1. اضغطي زر المشاركة <ICONS.share className="w-4 h-4 inline" /> في الأسفل.</p>
                                        <p>2. اختاري "إضافة إلى الصفحة الرئيسية".</p>
                                        <p>(Add to Home Screen)</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={promptInstall}
                                className="w-full bg-dark-green text-white py-3 rounded-xl font-bold shadow-lg hover:bg-pastel-green hover:text-dark-green transition-colors duration-300 flex items-center justify-center gap-2"
                            >
                                <ICONS.download className="w-5 h-5" />
                                تثبيت التطبيق
                            </button>
                        )}
                    </>
                ) : (
                   <p className="text-xs text-dark-green/50 border-t border-light-green pt-2 mt-2">
                       يمكنك استخدام التطبيق من المتصفح مباشرة أو إضافته يدوياً من إعدادات المتصفح.
                   </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeView;
