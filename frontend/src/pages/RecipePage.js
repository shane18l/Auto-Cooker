import React from 'react';
import { useLocation } from 'react-router-dom';
import './RecipePage.css';
import Navbar from './Navbar';


function RecipesPage() {

  const [authWarning, setAuthWarning] = React.useState('');
  const location = useLocation();
  const { recipes } = location.state || {};
  const [favoriteStates, setFavoriteStates] = React.useState(() =>
    recipes.reduce((acc, recipe) => {
      acc[recipe.id] = false;
      return acc;
    }, {})
  );

  const handleFavorite = async (recipe) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthWarning('Please log in to favorite recipes.');
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_BASE_URL}/add-favorite`, {
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
        // Toggle favorite state
        setFavoriteStates(prev => ({
          ...prev,
          [recipe.id]: !prev[recipe.id]
        }));
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
      {authWarning && <p className="auth-warning">{authWarning}</p>}
      {recipes && recipes.length > 0 ? (
        <div className="recipes-list">
          {recipes.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <div className="favorite-icon" onClick={() => handleFavorite(recipe)}>
                {favoriteStates[recipe.id] ? '⭐' : '☆'}
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
