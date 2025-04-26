from fastapi import APIRouter, Depends, Query, HTTPException
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

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    print("Got token:", token)
    return auth.verify_token(token, db)

# def get_current_user_id(token: str = Depends(oauth2_scheme)) -> int:
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("sub")
#         if user_id is None:
#             raise HTTPException(status_code=401, detail="Invalid token")
#         return int(user_id)
#     except JWTError:
#         raise HTTPException(status_code=401, detail="Invalid token")


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
    
    print("User:", user.email)
    print("Ingredients received:", payload.ingredients)
    for name in payload.ingredients:
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
