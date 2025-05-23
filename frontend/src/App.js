import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import IngredientsPage from './pages/IngredientsPage'
import AuthPage from './pages/AuthPage'
import RecipePage from './pages/RecipePage'
import MyRecipes from './pages/MyRecipes'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
        <Route path="/fav_recipes" element={<MyRecipes />} />
        <Route path="/recipes" element={<RecipePage />} />
      </Routes>
    </Router>
  );
}

export default App;