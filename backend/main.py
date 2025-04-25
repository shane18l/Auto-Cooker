# import httpx
# from pydantic import BaseModel
# from sqlalchemy import Column, Integer, String, TIMESTAMP, Text, create_engine
# from sqlalchemy.orm import sessionmaker, Session
# from sqlalchemy.ext.declarative import declarative_base
# import bcrypt
# import jwt
# import os
# from dotenv import load_dotenv
# import datetime
# from datetime import datetime, timedelta


from fastapi import FastAPI, Query, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
  
from fastapi.middleware.cors import CORSMiddleware


from typing import List  # Helps type-check ingredients like List[str]
import auth
import crud


app = FastAPI()  # Create a FastAPI "app" instance (your server)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(crud.router)


# load_dotenv()  # Load variables from the .env file

# SECRET_KEY = os.getenv("SECRET_KEY")
# SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")
# DATABASE_URL = os.getenv("DATABASE_URL")
# ALGORITHM = "HS256"


#SQL Setup
# engine = create_engine(DATABASE_URL)
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
# Base = declarative_base()

# class User(Base):
#     __tablename__ = 'users'
#     user_id = Column(Integer, primary_key=True, index=True)
#     email = Column(String, unique=True, index=True)
#     password_hash = Column(String)
#     created_at = Column(TIMESTAMP)

# class UserCreate(BaseModel):
#     email: str
#     password: str

# class UserOut(BaseModel):
#     email: str
#     user_id: int    

# class UserLogin(BaseModel):
#     email: str
#     password: str

# class Ingredient(Base):
#     __tablename__ = 'ingredients'
#     id = Column(Integer, primary_key=True)
#     name = Column(String, nullable=False)
#     user_id = Column(Integer)
# class Recipe(Base):
#     __tablename__ = 'recipes'
#     id = Column(Integer, primary_key=True)
#     title = Column(String, nullable=False)
#     url = Column(String)  # 🔗 URL to the full recipe
#     image = Column(String)  # 🖼️ Thumbnail or preview image
#     ingredients = Column(Text)  # could be comma-separated or JSON string
#     user_id = Column(Integer)   

# def get_db():
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()    

# def verify_token(token: str, db: Session):
#     try:
#         # Decode the token using the secret key and algorithm
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         user_id = payload.get("sub")  # 'sub' is the standard claim name for user identification
#         if user_id is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="Token has no user information"
#             )
        
#         # Retrieve the user from the database
#         user = db.query(models.User).filter(models.User.id == user_id).first()
#         if user is None:
#             raise HTTPException(
#                 status_code=status.HTTP_401_UNAUTHORIZED,
#                 detail="User not found"
#             )
#         return user
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token has expired"
#         )
#     except jwt.JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid token"
#         )




# @app.post("/register", response_model=UserOut)
# async def register_user(user: UserCreate, db: Session = Depends(get_db)):
#     hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
#     db_user = User(email=user.email, password_hash=hashed_password.decode('utf-8'))
#     db.add(db_user)
#     db.commit()
#     db.refresh(db_user)
#     return db_user

# @app.post("/login")
# async def login_user(user: UserCreate, db: Session = Depends(get_db)):
#     db_user = db.query(User).filter(User.email == user.email).first()
#     if db_user is None:
#         raise HTTPException(status_code=400, detail="Invalid credentials")
    
#     # Verify password
#     if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
#         raise HTTPException(status_code=400, detail="Invalid credentials")
    
#     # Generate JWT token
#     token_data = {
#         "sub": db_user.email,
#         "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
#     }
#     token = jwt.encode(token_data, "secret-key", algorithm="HS256")
    
#     return {"access_token": token, 
#             "token_type": "bearer",
#             "email": db_user.email,}


# # Create a route: GET /recipes?ingredients=apple,banana
# @app.get("/recipes")
# async def get_recipes(ingredients: List[str] = Query(...)):
#     ingredient_str = ",".join(ingredients)  # Convert list to string

#     url = "https://api.spoonacular.com/recipes/findByIngredients"
#     params = {
#         "ingredients": ingredient_str,
#         "number": 5,  # Limit results
#         "apiKey": API_KEY
#     }

#     # Async web request to Spoonacular
#     async with httpx.AsyncClient() as client:
#         response = await client.get(url, params=params)

#     # If successful, return recipes
#     if response.status_code == 200:
#         return response.json()
#     else:
#         return {"error": f"Failed to fetch recipes, status: {response.status_code}"}

# def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
#     # This function should verify the token and retrieve the current user from the database.
#     user = verify_token(token, db)
#     if user is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid authentication credentials",
#         )
#     return user


# @app.post("/save-ingredients")
# def save_ingredients(ingredients: List[str], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
#     for name in ingredients:
#         db.add(Ingredient(name=name, user_id=user.id))
#     db.commit()
#     return {"message": "Ingredients saved"}

# @app.post("/save-recipes")
# def save_recipes(recipes: List[str], user: User = Depends(get_current_user), db: Session = Depends(get_db)):
#     for title in recipes:
#         db.add(Recipe(title=title, user_id=user.id, ingredients=",".join(...)))
#     db.commit()
#     return {"message": "Recipes saved"}
    
