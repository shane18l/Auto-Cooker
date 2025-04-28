import React from 'react';
import { useLocation } from 'react-router-dom';
import './RecipePage.css';
import Navbar from './Navbar';

function RecipesPage() {
  const location = useLocation();
  const { recipes } = location.state || {};  // Get recipes from the state passed from IngredientsPage
  
  return (
    <div className="recipes-container">
      <Navbar />
      <h1>🍽️ Recipe Suggestions</h1>
      {recipes && recipes.length > 0 ? (
        <div className="recipes-list">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <img
                src={recipe.image}
                alt={recipe.title}
                onError={(e) => { e.target.onerror = null; e.target.src = 'https://spoonacular.com/application/frontend/images/default-food.png'; }}
              />
              <h2>{recipe.title}</h2>
              <a href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`} target="_blank" rel="noopener noreferrer">
                View Recipe
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p>No recipes found for your ingredients.</p>
      )}
    </div>
  );
}

export default RecipesPage;