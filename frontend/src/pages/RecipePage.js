import React from 'react';
import { useLocation } from 'react-router-dom';
import './RecipePage.css';
import Navbar from './Navbar';

function RecipesPage() {
  const location = useLocation();
  const { recipes } = location.state || {};

  const handleFavorite = async (recipe) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("You must be logged in to favorite a recipe!");
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/add-favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          url: `https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`,
        })
      });

      if (response.ok) {
        alert('Recipe added to favorites!');
      } else {
        alert('Failed to add favorite.');
      }
    } catch (error) {
      console.error('Error favoriting recipe:', error);
    }
  };

  return (
    <div className="recipes-container">
      <Navbar />
      <h1>🍽️ Recipe Suggestions</h1>
      {recipes && recipes.length > 0 ? (
        <div className="recipes-list">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <div className="favorite-icon" onClick={() => handleFavorite(recipe)}>
                ⭐
              </div>
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
