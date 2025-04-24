import React, { useState } from 'react';

function App() {
  const [ingredients, setIngredients] = useState(''); // Text from user
  const [recipes, setRecipes] = useState([]);         // Recipes from backend

  const handleInputChange = (e) => {
    setIngredients(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent form from refreshing the page

    try {
      const response = await fetch(`http://127.0.0.1:8000/recipes?ingredients=${ingredients}`);
      const data = await response.json();
      console.log("working", data)
      setRecipes(data); // Save recipes to state
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>🍳 Recipe Recommender</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={ingredients}
          onChange={handleInputChange}
          placeholder="Enter ingredients (e.g., eggs, milk)"
          style={{ width: '300px', padding: '0.5rem', marginRight: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>Get Recipes</button>
      </form>

      <div style={{ marginTop: '2rem' }}>
        <h2>🥘 Suggested Recipes:</h2>
        {recipes.length > 0 ? (
          <ul>
            {recipes.map((recipe) => (
              <li key={recipe.id}>{recipe.title}</li>
            ))}
          </ul>
        ) : (
          <p>No recipes yet. Try entering some ingredients above!</p>
        )}
      </div>
    </div>
  );
}

export default App;