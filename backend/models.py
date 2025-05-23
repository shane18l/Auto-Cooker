from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, DateTime
from sqlalchemy.sql import func
from database import Base

class User(Base): 
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String) 
    created_at = Column(TIMESTAMP)

class Ingredient(Base): 
    __tablename__ = 'user_ingredients'
    id = Column(Integer, primary_key=True)
    ingredient_name = Column(String, nullable=False)
    user_id = Column(Integer)
    created_at = Column(DateTime, server_default=func.now())

class Recipe(Base):
    __tablename__ = 'favorite_recipes' 
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_id = Column(Integer) 
    user_id = Column(Integer) 
    recipe_title = Column(String, nullable=False)
    source_url = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class FeaturedRecipe(Base):
    __tablename__ = 'featured_recipes' 
    id = Column(Integer, primary_key=True, autoincrement=True)
    recipe_title = Column(String, nullable=False)
    source_url = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime, server_default=func.now())
    