import os
import json
import base64
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from dotenv import load_dotenv

import models
from database import engine, SessionLocal
from google import genai
from google.genai import types

load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="People's Priorities API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class IssueBase(BaseModel):
    title: str
    description: str
    category: str
    latitude: float
    longitude: float
    language: str

class IssueCreate(IssueBase):
    image_base64: Optional[str] = None

class IssueResponse(IssueBase):
    id: str
    priority_score: int
    sentiment: str
    urgency: str
    explanation: str
    created_at: datetime
    status: str

    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

# Helper to initialize mock data if DB is empty
def init_mock_data(db: Session):
    if db.query(models.IssueModel).count() == 0:
        mock1 = models.IssueModel(
            title="Severe Potholes on Main Street",
            description="Multiple large potholes causing traffic blocks and accidents.",
            category="Roads",
            latitude=19.0760,
            longitude=72.8777,
            language="en",
            priority_score=92,
            sentiment="Negative",
            urgency="High",
            explanation="High traffic area with potential for accidents. Needs immediate fixing."
        )
        db.add(mock1)
        db.commit()

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    init_mock_data(db)
    db.close()


def analyze_issue_with_gemini(issue_data: IssueCreate):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY not found. Using mock AI response.")
        return {
            "priority_score": 85,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Mocked: The issue severely impacts local area and requires immediate attention."
        }
    
    try:
        client = genai.Client(api_key=api_key)
        
        prompt_text = f"""
        You are an AI assistant for a government constituency development platform.
        A citizen has submitted the following issue:
        Title: {issue_data.title}
        Description: {issue_data.description}
        Category: {issue_data.category}
        Language: {issue_data.language}
        """
        
        if issue_data.image_base64:
            prompt_text += "\nThe user has also uploaded an image. Please analyze it for signs of damage, potholes, garbage, or other issues related to their text."

        prompt_text += """
        Please analyze this issue and return ONLY a JSON object with the following fields:
        - priority_score (integer between 1 and 100, where 100 is most critical)
        - sentiment (e.g., "Negative", "Neutral", "Positive")
        - urgency (e.g., "Low", "Medium", "High", "Critical")
        - explanation (A 1-2 sentence Explainable AI justification for the priority score)
        
        Format the output as valid JSON.
        """
        
        contents = [prompt_text]
        if issue_data.image_base64:
            try:
                # Remove data:image/...;base64, if present
                b64_str = issue_data.image_base64
                if "," in b64_str:
                    b64_str = b64_str.split(",")[1]
                image_bytes = base64.b64decode(b64_str)
                contents.append(
                    types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
                )
            except Exception as e:
                print(f"Failed to decode image: {e}")

        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
        )
        
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        result = json.loads(text.strip())
        return {
            "priority_score": result.get("priority_score", 50),
            "sentiment": result.get("sentiment", "Neutral"),
            "urgency": result.get("urgency", "Medium"),
            "explanation": result.get("explanation", "AI analyzed the severity and impact of this issue.")
        }
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return {
            "priority_score": 75,
            "sentiment": "Unknown",
            "urgency": "Medium",
            "explanation": "Fallback due to AI processing error."
        }


@app.post("/issues", response_model=IssueResponse)
def create_issue(issue: IssueCreate, db: Session = Depends(get_db)):
    ai_analysis = analyze_issue_with_gemini(issue)
    
    db_issue = models.IssueModel(
        title=issue.title,
        description=issue.description,
        category=issue.category,
        latitude=issue.latitude,
        longitude=issue.longitude,
        language=issue.language,
        priority_score=ai_analysis["priority_score"],
        sentiment=ai_analysis["sentiment"],
        urgency=ai_analysis["urgency"],
        explanation=ai_analysis["explanation"]
    )
    
    db.add(db_issue)
    db.commit()
    db.refresh(db_issue)
    return db_issue

@app.get("/dashboard/issues", response_model=List[IssueResponse])
def get_dashboard_issues(db: Session = Depends(get_db)):
    return db.query(models.IssueModel).order_by(models.IssueModel.priority_score.desc()).all()

@app.get("/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total = db.query(models.IssueModel).count()
    high = db.query(models.IssueModel).filter(models.IssueModel.urgency.in_(["High", "Critical"])).count()
    resolved = db.query(models.IssueModel).filter(models.IssueModel.status == "Closed").count()
    
    return {
        "total_issues": total,
        "high_priority": high,
        "resolved": resolved,
        "pending": total - resolved
    }

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(chat_req: ChatRequest, db: Session = Depends(get_db)):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "Mocked: I am the MP Assistant. Please configure GEMINI_API_KEY to ask real questions about the data."}
    
    try:
        # Pull context from DB
        issues = db.query(models.IssueModel).all()
        issue_context = "\n".join([f"- {i.title} (Category: {i.category}, Priority: {i.priority_score}, Status: {i.status})" for i in issues])
        
        client = genai.Client(api_key=api_key)
        prompt = f"""
        You are an intelligent assistant for a Member of Parliament (MP). 
        You have access to the following current issues in the constituency:
        {issue_context}
        
        The MP asks: "{chat_req.message}"
        
        Answer professionally, concisely, and use the data provided above to back up your claims.
        """
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return {"reply": response.text.strip()}
    except Exception as e:
        print(f"Chat error: {e}")
        return {"reply": "Sorry, I encountered an error while analyzing the data."}
