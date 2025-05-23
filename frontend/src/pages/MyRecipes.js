import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipePage.css'; // Reuse the same CSS for consistency
import Navbar from './Navbar';
const API_URL = process.env.REACT_APP_API_URL;

const MyRecipes = () => {
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/auth');
          return;
        }

        const response = await fetch(`${API_URL}/get-favorites`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch favorites');
        const data = await response.json();
        setFavorites(data.favorites);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const handleUnfavorite = async (recipeId) => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/remove-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: recipeId }),
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(r => r.id !== recipeId));
        setMessage('Recipe removed from favorites.');
        setTimeout(() => setMessage(''), 1500);
      } else {
        setMessage('Failed to remove recipe.');
        setTimeout(() => setMessage(''), 1500);
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  return (
    <div className="recipes-container">
      <Navbar />
      <h1>⭐ My Recipes</h1>
      {message && <p className="message">{message}</p>}
      {favorites.length === 0 ? (
        <p>No favorite recipes found.</p>
      ) : (
        <div className="recipes-list">
          {favorites.map((recipe, index) => (
            <div key={index} className="recipe-card">
              <div className="favorite-icon" onClick={() => handleUnfavorite(recipe.id)}>
                ❌
              </div>
              <img
                src={recipe.image}
                alt={recipe.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://spoonacular.com/application/frontend/images/default-food.png';
                }}
              />
              <h2>{recipe.title}</h2>
              <a href={`https://spoonacular.com/recipes/${recipe.title.replace(/\s+/g, '-').toLowerCase()}-${recipe.id}`} target="_blank" rel="noopener noreferrer">
                View Recipe
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRecipes;