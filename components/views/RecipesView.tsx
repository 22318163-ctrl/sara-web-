
import React, { useState } from 'react';
import { HEALTHY_RECIPES, ICONS } from '../../constants';
import { Recipe } from '../../types';
import { useHabitStore } from '../../hooks/useHabitStore';
import AddRecipeModal from '../AddRecipeModal';

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void }> = ({ recipe, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white rounded-2xl shadow-sm border border-light-green overflow-hidden cursor-pointer hover:shadow-md transition-all relative"
    >
        {recipe.isCustom && (
            <span className="absolute top-2 left-2 bg-pastel-green text-dark-green text-xs font-bold px-2 py-1 rounded-full z-10">وصفة خاصة</span>
        )}
        {recipe.image ? (
            <img src={recipe.image} alt={recipe.name} className="w-full h-32 object-cover" />
        ) : (
            <div className="w-full h-32 bg-light-green/20 flex items-center justify-center text-4xl">🥗</div>
        )}
        <div className="p-4">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-dark-green text-lg">{recipe.name}</h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full flex items-center gap-1">
                    <ICONS.fire className="w-3 h-3" />
                    {recipe.calories}
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-dark-green/60 mb-3">
                <span>⏱️ {recipe.time}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
                {recipe.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-pastel-green/30 text-dark-green px-2 py-1 rounded-full">{tag}</span>
                ))}
            </div>
        </div>
    </div>
);

const RecipeModal: React.FC<{ recipe: Recipe; onClose: () => void }> = ({ recipe, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
        <div className="bg-creamy rounded-2xl p-6 w-full max-w-md shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
             <button onClick={onClose} className="absolute top-4 left-4 bg-white rounded-full p-1 text-dark-green shadow-sm z-10">
                 <ICONS.back className="w-6 h-6 rotate-180" />
             </button>
             
             <div className="mb-6">
                 <h2 className="text-2xl font-bold text-dark-green mb-1">{recipe.name}</h2>
                 <div className="flex gap-3 text-sm text-dark-green/70">
                     <span className="flex items-center gap-1"><ICONS.fire className="w-4 h-4" /> {recipe.calories} سعرة</span>
                     <span>⏱️ {recipe.time}</span>
                 </div>
             </div>

             <div className="space-y-4">
                 <div className="bg-white p-4 rounded-xl border border-light-green">
                     <h4 className="font-bold text-dark-green mb-3 border-b border-light-green pb-2">🥣 المكونات</h4>
                     <ul className="space-y-2">
                         {recipe.ingredients.map((ing, i) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-dark-green/80">
                                 <span className="w-1.5 h-1.5 bg-pastel-green rounded-full mt-1.5 shrink-0"></span>
                                 {ing}
                             </li>
                         ))}
                     </ul>
                 </div>

                 <div className="bg-white p-4 rounded-xl border border-light-green">
                     <h4 className="font-bold text-dark-green mb-3 border-b border-light-green pb-2">👨‍🍳 طريقة التحضير</h4>
                     <div className="space-y-3">
                         {recipe.steps.map((step, i) => (
                             <div key={i} className="flex gap-3">
                                 <span className="font-bold text-soft-gold text-lg">{i + 1}</span>
                                 <p className="text-sm text-dark-green/80 leading-relaxed pt-1">{step}</p>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    </div>
);

const RecipesView: React.FC = () => {
    const { customRecipes } = useHabitStore();
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const allRecipes = [...customRecipes, ...HEALTHY_RECIPES];

    return (
        <div className="space-y-6 animate-fade-in pb-24">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-dark-green">وصفات صحية 🥗</h1>
                    <p className="text-dark-green/70 mt-1 text-sm">أفكار لذيذة ومغذية ليومك</p>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-pastel-green text-dark-green rounded-full h-12 w-12 flex items-center justify-center shadow-md hover:bg-dark-green hover:text-white transition-colors"
                >
                  <ICONS.plus className="h-7 w-7" />
                </button>
            </header>

            <div className="grid grid-cols-1 gap-4">
                {allRecipes.map(recipe => (
                    <RecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        onClick={() => setSelectedRecipe(recipe)} 
                    />
                ))}
            </div>

            {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />}
            {isAddModalOpen && <AddRecipeModal onClose={() => setIsAddModalOpen(false)} />}
        </div>
    );
};

export default RecipesView;
