import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './IngredientsPage.css'; // You can create a new CSS file
import Navbar from './Navbar';
import validIngredients from '../ingredients.json';

function IngredientsPage() {
  const [input, setInput] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserIngredients = async () => {
      console.log("Stored token:", localStorage.getItem('token'));
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/get-ingredients', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setIngredientList(data.ingredients); // assuming your backend returns { "ingredients": ["egg", "milk"] }
        } else {
          console.error("Failed to fetch ingredients");
        }
      } catch (error) {
        console.error("Error fetching ingredients:", error);
      }
    };

    fetchUserIngredients();
  }, []);

  const handleAddIngredient = (customInput) => {
    const rawInput = customInput !== undefined ? customInput : input;
    const trimmedInput = rawInput.trim().toLowerCase();
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
    console.log("Fetching Recipes")
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

        const response = await fetch('http://localhost:8000/generate-recipes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ingredients: ingredientList }),
        });
      
          if (response.ok) {
            const recipes = await response.json();
            // Redirect to recipes page with fetched recipes
            navigate('/recipes', { state: { recipes } });
          } else {
            console.error("Failed to fetch recipes");
          }
      } catch (err) {
        console.error("Error saving ingredients:", err);
      }
    }
  };

  return (
    <div className="ingredients-container">
        <Navbar />
      <h1>🧺 Your Fridge</h1>
        <div className="ingredients-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                const value = e.target.value;
                setInput(value);
                if (value.length > 0) {
                  const matches = validIngredients.filter(ingredient =>
                    ingredient.toLowerCase().includes(value.toLowerCase())
                  ).slice(0, 5); // Limit to 10 suggestions
              
                  setSuggestions(matches);
                } else {
                  setSuggestions([]);
                }
              }}
              placeholder="e.g., eggs, milk"
            />
            {suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => {
                  handleAddIngredient(suggestion);
                  setSuggestions([]);
                }}>
                  {suggestion}
                </li>
              ))}
            </ul>
            )}
          </div>
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