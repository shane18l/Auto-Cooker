import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './IngredientsPage.css'; // You can create a new CSS file
import Navbar from './Navbar';
import validIngredients from '../ingredients.json';

function IngredientsPage() {
  const [input, setInput] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const navigate = useNavigate();

  const handleAddIngredient = () => {
    const trimmedInput = input.trim().toLowerCase();
    if (trimmedInput && validIngredients.includes(trimmedInput)) {
      setIngredientList([...ingredientList, trimmedInput]);
      setInput('');
    } else {
      alert('Please enter a valid ingredient.');
    }
  };

  const handleRemoveIngredient = async (index) => {
    const removedIngredient = ingredientList[index];
    const updatedList = ingredientList.filter((_, i) => i !== index);
    setIngredientList(updatedList);
  
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch('http://localhost:8000/remove-ingredient', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ingredient: removedIngredient }),
        });
      } catch (err) {
        console.error("Error removing ingredient:", err);
      }
    }
  };

  const handleGenerateRecipes = async () => {
    console.log("hey")
    const token = localStorage.getItem('token');
    console.log("Token:", token);
    if (!token) {
      console.error('No token found');
      return; // Stop further execution if no token
    }
    if (ingredientList.length > 0) {
      try {
        // STEP 1: Save ingredients to the database
        await fetch('http://localhost:8000/save-ingredients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // only if using auth
          },
          body: JSON.stringify({ ingredients: ingredientList }),
        });
  
        // // STEP 2: Navigate to recipes page
        // const query = ingredientList.join(',');
        // navigate(`/recipes?ingredients=${encodeURIComponent(query)}`);
      } catch (err) {
        console.error("Error saving ingredients:", err);
      }
    }
  };

  return (
    <div className="ingredients-container">
        <Navbar />
      <h1>🧺 What's in Your Fridge?</h1>
      <div className="input-group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., eggs, milk"
          />
          <button onClick={handleAddIngredient}>Add Ingredient</button>
          <button onClick={handleGenerateRecipes}>Generate Recipes</button>
        </div>
        {ingredientList.length > 0 && (
          <div className="ingredient-list">
            {ingredientList.map((ingredient, index) => (
              <div key={index} className="ingredient-card">
                <img
                  src={`https://spoonacular.com/cdn/ingredients_100x100/${ingredient}.jpg`}
                  alt={ingredient}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://spoonacular.com/application/frontend/images/default-food.png'; }}
                />
                <p>{ingredient}</p>
                <button className="remove-btn" onClick={() => handleRemoveIngredient(index)}>-</button>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

export default IngredientsPage;