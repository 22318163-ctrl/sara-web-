
import React, { useRef, useState } from 'react';
import { useHabitStore } from '../hooks/useHabitStore';
import { ICONS } from '../constants';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsModalProps {
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { exportData, importData, userName, notificationsEnabled, requestNotificationPermission } = useHabitStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const { deferredPrompt, isIOS, isStandalone, promptInstall } = usePWAInstall();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const handleDownload = () => {
    const dataStr = exportData();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `habits-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatusMessage('تم حفظ النسخة الاحتياطية بنجاح ✅');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const success = importData(content);
        if (success) {
            setStatusMessage('تم استرجاع البيانات بنجاح 🎉');
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setStatusMessage('فشل استرجاع البيانات. تأكدي من الملف ❌');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-creamy rounded-2xl p-6 w-full max-w-sm shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 left-4 text-dark-green/60 hover:text-dark-green">
             ✕
        </button>
        
        <div className="text-center mb-6">
            <div className="w-16 h-16 bg-pastel-green rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
                ⚙️
            </div>
            <h2 className="text-2xl font-bold text-dark-green">الإعدادات</h2>
            <p className="text-dark-green/60 text-sm mt-1">مرحباً {userName}</p>
        </div>

        <div className="space-y-4">
             {/* Install App Section */}
             {!isStandalone && (deferredPrompt || isIOS) && (
                <div className="bg-gradient-to-r from-pastel-green/50 to-light-green/50 p-4 rounded-xl border border-light-green">
                    <h3 className="font-bold text-dark-green mb-2 flex items-center gap-2">
                        <ICONS.phone className="w-5 h-5" />
                        تثبيت / تحميل التطبيق
                    </h3>
                    <p className="text-xs text-dark-green/70 mb-3">
                        {isIOS ? 'ثبتي التطبيق على شاشتك الرئيسية لسهولة الوصول.' : 'حولي الموقع لتطبيق موبايل واستمتعي بشاشة كاملة.'}
                    </p>
                    
                    {isIOS ? (
                        <div>
                            <button 
                                onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                                className="w-full bg-white text-dark-green py-2 rounded-lg hover:bg-dark-green hover:text-white transition-colors font-bold text-sm shadow-sm"
                            >
                                {showIOSInstructions ? 'إخفاء التعليمات' : 'طريقة التثبيت (آيفون)'}
                            </button>
                            {showIOSInstructions && (
                                <div className="mt-3 text-xs text-dark-green/80 space-y-2 bg-white p-3 rounded-lg">
                                    <p className="flex items-center gap-2">1. اضغطي زر المشاركة <ICONS.share className="w-4 h-4 inline" /> في المتصفح بالأسفل.</p>
                                    <p>2. اختاري "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button 
                            onClick={promptInstall}
                            className="w-full bg-dark-green text-white py-2 rounded-lg hover:bg-opacity-90 transition-colors font-bold text-sm shadow-md"
                        >
                            تثبيت الآن
                        </button>
                    )}
                </div>
             )}

             <div className="bg-white p-4 rounded-xl border border-light-green">
                <h3 className="font-bold text-dark-green mb-2 flex items-center gap-2">
                    <ICONS.bell className="w-5 h-5" />
                    التنبيهات
                </h3>
                <p className="text-xs text-dark-green/70 mb-3">استقبلي إشعارات لتذكيرك بمواعيد عاداتك.</p>
                {notificationsEnabled ? (
                    <div className="bg-green-100 text-green-800 p-2 rounded text-center text-sm font-bold">
                        مفعلة ✅
                    </div>
                ) : (
                    <button 
                        onClick={requestNotificationPermission}
                        className="w-full bg-pastel-green text-dark-green py-2 rounded-lg hover:bg-dark-green hover:text-white transition-colors font-bold text-sm"
                    >
                        تفعيل التنبيهات
                    </button>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl border border-light-green">
                <h3 className="font-bold text-dark-green mb-2">نسخ البيانات احتياطياً</h3>
                <p className="text-xs text-dark-green/70 mb-4">احفظي ملفاً يحتوي على كل عاداتك وسجلاتك بأمان على جهازك.</p>
                <button 
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 bg-dark-green text-white py-3 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    <ICONS.download className="w-5 h-5" />
                    حفظ نسخة احتياطية
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl border border-light-green">
                <h3 className="font-bold text-dark-green mb-2">استرجاع البيانات</h3>
                <p className="text-xs text-dark-green/70 mb-4">استعيدي بياناتك من ملف محفوظ مسبقاً. (سيتم استبدال البيانات الحالية)</p>
                <button 
                    onClick={handleImportClick}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dark-green text-dark-green py-3 rounded-lg hover:bg-dark-green hover:text-white transition-colors"
                >
                    <ICONS.upload className="w-5 h-5" />
                    رفع ملف نسخة احتياطية
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".json"
                    className="hidden"
                />
            </div>
        </div>
        
        {statusMessage && (
            <div className="mt-4 p-3 bg-pastel-green/50 text-dark-green rounded-lg text-center text-sm font-bold animate-bounce-subtle">
                {statusMessage}
            </div>
        )}

      </div>
    </div>
  );
};

export default SettingsModal;
