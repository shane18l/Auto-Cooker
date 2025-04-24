from fastapi import FastAPI, Query, Depends, HTTPException  # FastAPI tools
import httpx  # Makes web requests
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, TIMESTAMP, create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import bcrypt
import jwt
import datetime
from typing import List  # Helps type-check ingredients like List[str]

app = FastAPI()  # Create a FastAPI "app" instance (your server)
API_KEY = "30bb1e63e13d4f409abea6dad27dcc13"  # Your Spoonacular API key

#SQL Setup
DATABASE_URL = "postgresql://postgres:sql9086@localhost/recipe_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(TIMESTAMP)

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    email: str
    user_id: int    
class UserLogin(BaseModel):
    email: str
    password: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()    


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow your React app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=UserOut)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = User(email=user.email, password_hash=hashed_password.decode('utf-8'))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/login")
async def login_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user is None:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify password
    if not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Generate JWT token
    token_data = {
        "sub": db_user.email,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }
    token = jwt.encode(token_data, "secret-key", algorithm="HS256")
    
    return {"access_token": token, "token_type": "bearer"}


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
    
