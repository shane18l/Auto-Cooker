import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './IngredientsPage.css'; // You can create a new CSS file
import Navbar from './Navbar';
import validIngredients from '../ingredients.json';
const API_URL = process.env.REACT_APP_API_URL;

function IngredientsPage() {
  const [input, setInput] = useState('');
  const [ingredientList, setIngredientList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();
  const [invalidIngredients, setInvalidIngredients] = useState([]);

  useEffect(() => {
    const fetchUserIngredients = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/get-ingredients`, {
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

  const validateAllIngredients = async (ingredients) => {
    const invalid = [];

    for (const ing of ingredients) {
      const res = await fetch(`${API_URL}/validateIngredient?query=${encodeURIComponent(ing)}`);
      const data = await res.json();

      if (!data.valid) {
        invalid.push({ name: ing, suggestions: data.suggestions });
      }
    }

    return invalid;
  };

  const handleAddIngredient = (customInput) => {
    const rawInput = String(customInput !== undefined ? customInput : input);
    const trimmedInput = rawInput.trim().toLowerCase();
    setIngredientList([...ingredientList, trimmedInput]);
    setInput('');
    setSuggestions([]);
  }

  const handleRemoveIngredient = async (index) => {
    const removedIngredient = ingredientList[index];
    const updatedList = ingredientList.filter((_, i) => i !== index);
    setIngredientList(updatedList);
  
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${API_URL}/remove-ingredient`, {
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
    const invalids = await validateAllIngredients(ingredientList);
    if (invalids.length > 0) {
      setInvalidIngredients(invalids);
      return;
    }
    const token = localStorage.getItem('token');
    if (ingredientList.length > 0) {
      if (token) { 
        try {
          // STEP 1: Save ingredients to the database
          await fetch(`${API_URL}/save-ingredients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}` // only if using auth
            },
            body: JSON.stringify({ ingredients: ingredientList }),
          });
        }
        catch (err) {
          console.error("Error saving ingredients:", err);
        }
      }
      const response = await fetch(`/generate-recipes`, {
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
                if (value.length > ${API_URL}0) {
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
                <li key={index} onClick={async () => {
                  setInput(suggestion);
                  setSuggestions([]);
                }}>
                  {suggestion}
                </li>
              ))}
            </ul>
            )}
          </div>
            <button onClick={() => handleAddIngredient()}>Add Ingredient</button>
            <button onClick={handleGenerateRecipes}>Generate Recipes</button>
        </div>
        {invalidIngredients.length > 0 && (
          <div className="invalid-ingredient-warning">
            <p>The following ingredients are invalid:</p>
            <ul>
              {invalidIngredients.map((item, idx) => (
                <li key={idx} style={{ color: 'red' }}>
                  {item.name} — suggestions: {item.suggestions.join(', ') || 'none'}
                </li>
              ))}
            </ul>
          </div>
        )}
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