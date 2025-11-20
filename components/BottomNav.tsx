
import React from 'react';
import { Page } from '../types';
import { ICONS } from '../constants';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  page: Page;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
}> = ({ page, label, icon: Icon, isActive, onClick }) => {
  const activeClass = isActive ? 'text-dark-green' : 'text-pastel-green';
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[64px] transition-colors duration-200 ${activeClass}`}
    >
      <Icon className="h-6 w-6 mb-1" />
      <span className="text-xs whitespace-nowrap">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const navItems: { page: Page; label: string; icon: React.ElementType }[] = [
    { page: 'today', label: 'اليوم', icon: ICONS.today },
    { page: 'habits', label: 'العادات', icon: ICONS.habits },
    { page: 'weight', label: 'رشاقتي', icon: ICONS.weight },
    { page: 'recipes', label: 'وصفات', icon: ICONS.recipes },
    { page: 'religious', label: 'ديني', icon: ICONS.religious },
    { page: 'drinks', label: 'مشروباتي', icon: ICONS.drinks },
    { page: 'vitamins', label: 'فيتامينات', icon: ICONS.vitamins },
    { page: 'self-care', label: 'عناية', icon: ICONS.selfCare },
    { page: 'period', label: 'دورتي', icon: ICONS.period },
    { page: 'mood', label: 'المزاج', icon: ICONS.mood },
    { page: 'meals', label: 'الوجبات', icon: ICONS.meals },
    { page: 'meals-log', label: 'سجل الوجبات', icon: ICONS.mealsLog },
    { page: 'sports', label: 'رياضة', icon: ICONS.sports },
    { page: 'journal', label: 'مساحتي', icon: ICONS.journal },
    { page: 'monthly', label: 'الحصاد', icon: ICONS.monthly },
  ];

  return (
    <nav className="fixed bottom-0 right-0 left-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] max-w-lg mx-auto rounded-t-2xl z-50">
      <div className="flex items-center h-20 px-2 overflow-x-auto no-scrollbar snap-x">
        {navItems.map(item => (
          <div key={item.page} className="snap-center flex-1">
             <NavItem
                page={item.page}
                label={item.label}
                icon={item.icon}
                isActive={activePage === item.page}
                onClick={() => setActivePage(item.page)}
             />
          </div>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
