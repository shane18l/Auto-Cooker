from fastapi import APIRouter, Depends, Query, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from fastapi.security import OAuth2PasswordBearer
from typing import List
import httpx
import os
from dotenv import load_dotenv
from database import get_db
import models, auth
from models import User
import requests
from datetime import datetime, date
import random
import json
from pathlib import Path


load_dotenv()
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" 

class IngredientList(BaseModel):
    ingredients: List[str]

class IngredientToRemove(BaseModel):
    ingredient: str

class FavouriteRecipe(BaseModel):
    id: int
    title: str 
    image: str
    url: str

class RecipeRequest(BaseModel):
    id: int




BATCH_SIZE = 1000
API_URL = f'https://api.spoonacular.com/recipes/random?number={BATCH_SIZE}&apiKey={SPOONACULAR_API_KEY}'




# # Fetch 100 random recipes
# response = requests.get(API_URL)
# data = response.json()

# db_gen = get_db()
# db: Session = next(db_gen)

# for recipe in data.get('recipes', []):
#     new_recipe = models.FeaturedRecipe(
#                     recipe_title = recipe.get("title"),
#                     image_url = recipe.get("sourceUrl", ""),
#                     source_url = recipe.get("image", ""),
#                     created_at=datetime.utcnow(),
#                 )
#     db.add(new_recipe)

# db.commit()

# print(f"Inserted {len(data['recipes'])} recipes.")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print("Got token:", token)
    return auth.verify_token(token, db)

 
@router.get("/recipes")
async def get_recipes(ingredients: List[str] = Query(...)):
    url = "https://api.spoonacular.com/recipes/findByIngredients"
    params = {
        "ingredients": ",".join(ingredients),
        "number": 5,
        "apiKey": SPOONACULAR_API_KEY
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        raise HTTPException(status_code=500, detail="Failed to fetch recipes")

@router.post("/save-ingredients")
def save_ingredients(
    payload: IngredientList,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    
    existing_ingredients = db.query(models.Ingredient).filter_by(user_id=user.user_id).all()
    existing_names = set([ing.ingredient_name for ing in existing_ingredients])
    for name in payload.ingredients:
        if name not in existing_names:
            db.add(models.Ingredient(ingredient_name=name, user_id=user.user_id))
    db.commit()
    return {"message": "Ingredients saved"}

@router.post("/save-recipes")
def save_recipes(recipes: List[dict], user=Depends(get_current_user), db: Session = Depends(get_db)):
    for recipe in recipes:
        db.add(models.Recipe(
            title=recipe.get("title"),
            url=recipe.get("sourceUrl", ""),
            image=recipe.get("image", ""),
            ingredients=",".join(recipe.get("usedIngredients", [])),
            user_id=user.user_id
        ))
    db.commit()
    return {"message": "Recipes saved"}

@router.post("/remove-ingredient")
async def remove_ingredient(
    payload: IngredientToRemove,  
    db: Session = Depends(get_db),  
    current_user=Depends(get_current_user)):

    try:
        db.query(models.Ingredient).filter(
            models.Ingredient.user_id == current_user.user_id,
            models.Ingredient.ingredient_name == payload.ingredient
        ).delete()
        db.commit()
        return {"message": "Ingredient removed successfully"}
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Error removing ingredient")

@router.get("/get-ingredients")
def get_ingredients(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    print(current_user.email)
    ingredients = db.query(models.Ingredient).filter_by(user_id=current_user.user_id).all()
    return {"ingredients": [item.ingredient_name for item in ingredients]}

@router.post("/generate-recipes")
async def generate_recipes(request: Request):
    data = await request.json()
    ingredients = data.get("ingredients", []) 
    spoonacular_api_key = os.getenv("SPOONACULAR_API_KEY")  # you load from your .env
    
    if not ingredients:
        return JSONResponse(content={"error": "No ingredients provided"}, status_code=400)

    query = ",".join(ingredients)
    url = f"https://api.spoonacular.com/recipes/findByIngredients?ingredients={query}&apiKey={spoonacular_api_key}&number=5"

    response = requests.get(url)
    if response.ok:
        return response.json()
    else:
        return JSONResponse(content={"error": "Failed to fetch recipes"}, status_code=500)
    
@router.post("/add-favorite")
def add_favorite(
    payload: FavouriteRecipe,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
    ):
    favorite = models.Recipe(
        user_id = user.user_id,
        recipe_id = payload.id,
        recipe_title = payload.title,
        image_url = payload.image,
        source_url = payload.url,
        created_at=datetime.utcnow(),
    )
    db.add(favorite)
    db.commit() 
    return {"message": "Ingredients saved"}

@router.get("/get-favorites")
def get_favorite(
    user = Depends(get_current_user),
    db : Session = Depends(get_db),
    ): 
    favorites = db.query(models.Recipe).filter_by(user_id=user.user_id).all()
    return {
        "favorites": [
            {
                "id": fav.recipe_id,
                "title": fav.recipe_title,
                "image": fav.image_url,
                "url": fav.source_url,
            } for fav in favorites
        ]
    }

@router.post("/remove-favorite")
def remove_favorite(
    payload : RecipeRequest, 
    user = Depends(get_current_user), 
    db: Session = Depends(get_db),
    ):
    print(type(payload), payload)
    print(payload.id)
    recipe = db.query(models.Recipe).filter(
        models.Recipe.recipe_id == payload.id, 
        models.Recipe.user_id == user.user_id).first()
    if not recipe: 
        raise HTTPException(status_code=404, detail="Recipe not found")
    db.delete(recipe) 
    db.commit() 
    return {"message": "Recipe removed from favorites"}

@router.get("/featured")
def get_featured_recipes(db: Session = Depends(get_db)):
    all_recipes = db.query(models.FeaturedRecipe).all()

    # Use today's date to get consistent "random" recipes every day 
    random.seed(date.today().toordinal())
    featured = random.sample(all_recipes, min(5, len(all_recipes)))
    return featured

INGREDIENTS_FILE = Path("../frontend/src/ingredients.json")

def load_ingredients():
    if INGREDIENTS_FILE.exists():
        with open(INGREDIENTS_FILE) as f:
            return json.load(f)
    return []

def save_ingredients(ingredients):
    with open(INGREDIENTS_FILE, "w") as f:
        json.dump(sorted(set(ingredients)), f, indent=2)

@router.get("/validateIngredient")
async def validate_ingredient(query: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.spoonacular.com/food/ingredients/search",
            params={
                "query": query,
                "number": 5,
                "apiKey": SPOONACULAR_API_KEY
            }
        )

    data = response.json()
    suggestions = [item['name'].lower() for item in data.get("results", [])]

    # Load current ingredients
    current_ingredients = load_ingredients()
    query_lower = query.strip().lower()

    # Determine if exact match exists
    if query_lower not in suggestions and query_lower in current_ingredients:
        # Ingredient is invalid -> remove from file
        current_ingredients.remove(query_lower)
        print("Saving suggestions:", current_ingredients)
        save_ingredients(current_ingredients)

    # Add new suggestions if not already there
    updated = False
    for suggestion in suggestions:
        if suggestion not in current_ingredients:
            current_ingredients.append(suggestion)
            updated = True
    if updated:
        save_ingredients(current_ingredients)

    return {
        "valid": query_lower in suggestions,
        "suggestions": suggestions
    }