from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt
from jose import jwt, JWTError 
from datetime import datetime, timedelta
from database import get_db
import models 


from dotenv import load_dotenv
import os

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256" 

router = APIRouter()

class UserCreate(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    email: str
    user_id: int

    

@router.post("/register", response_model=UserOut)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    db_user = models.User(email=user.email, password_hash=hashed_password.decode('utf-8'))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login")
def login_user(user: UserCreate, db: Session = Depends(get_db)):
    print("SECRET_KEY (login):", SECRET_KEY)
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password_hash.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    expire = datetime.utcnow() + timedelta(hours=24)
    token_data = { 
        "sub": str(db_user.user_id), 
        "exp": expire
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "email": db_user.email
    }

def verify_token(token: str, db: Session):  
    print("SECRET_KEY (verify):", SECRET_KEY)
    print(f"All user IDs in DB: {[u.user_id for u in db.query(models.User).all()]}")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        print(f"Decoded token: {payload}")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = db.query(models.User).filter(models.User.user_id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user
    except JWTError:
        print("JWT error occurred")
        raise HTTPException(status_code=401, detail="Token expired or invalid")
