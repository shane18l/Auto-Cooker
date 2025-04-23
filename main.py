# d30bb1e63e13d4f409abea6dad27dcc13

from fastapi import FastAPI, Query  # FastAPI tools
import httpx  # Makes web requests
from typing import List  # Helps type-check ingredients like List[str]

app = FastAPI()  # Create a FastAPI "app" instance (your server)

API_KEY = "30bb1e63e13d4f409abea6dad27dcc13"  # Your Spoonacular API key

# Create a route: GET /recipes?ingredients=apple,banana
@app.get("/recipes")
async def get_recipes(ingredients: List[str] = Query(...)):
    ingredient_str = ",".join(ingredients)  # Convert list to string

    url = "https://api.spoonacular.com/recipes/findByIngredients"
    params = {
        "ingredients": ingredient_str,
        "number": 5,  # Limit results
        "apiKey": API_KEY
    }

    # Async web request to Spoonacular
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)

    # If successful, return recipes
    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Failed to fetch recipes, status: {response.status_code}"}