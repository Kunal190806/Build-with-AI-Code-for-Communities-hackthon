import datetime
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import random
import uuid

# Re-create tables just in case
models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Check if we already have a lot of data to prevent duplicate seeding
    if db.query(models.IssueModel).count() > 5:
        print("Database already has seed data. Exiting.")
        db.close()
        return

    mumbai_center_lat = 19.0760
    mumbai_center_lon = 72.8777
    
    issues_data = [
        {
            "title": "Severe Potholes on Western Express Highway",
            "description": "Large potholes near Andheri causing massive traffic snarls and accidents during monsoon.",
            "category": "Roads",
            "language": "en",
            "priority_score": 95,
            "sentiment": "Negative",
            "urgency": "Critical",
            "explanation": "High traffic artery with immediate safety risks for thousands of commuters."
        },
        {
            "title": "Contaminated Water Supply in Dharavi",
            "description": "Drinking water has a foul smell and yellow tint for the past 3 days.",
            "category": "Water Supply",
            "language": "en",
            "priority_score": 98,
            "sentiment": "Very Negative",
            "urgency": "Critical",
            "explanation": "Severe public health risk affecting a densely populated area."
        },
        {
            "title": "Streetlights not working in Bandra West",
            "description": "Entire lane near Carter Road is dark, causing safety concerns for women walking at night.",
            "category": "Electricity",
            "language": "en",
            "priority_score": 85,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Directly impacts citizen safety and crime prevention."
        },
        {
            "title": "Shortage of medicines at BMC Clinic, Kurla",
            "description": "Basic fever and malaria medicines are out of stock for a week.",
            "category": "Healthcare",
            "language": "en",
            "priority_score": 90,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Essential healthcare service disruption during viral season."
        },
        {
            "title": "Garbage dumping near Primary School in Powai",
            "description": "Open garbage dump overflowing near the school gate, causing terrible stench and mosquitoes.",
            "category": "Sanitation",
            "language": "en",
            "priority_score": 88,
            "sentiment": "Very Negative",
            "urgency": "High",
            "explanation": "Health hazard for children and violation of sanitation norms."
        },
        {
            "title": "Need new bus stop shelter in Vikhroli",
            "description": "The old shelter broke down in the rain, citizens getting drenched while waiting for buses.",
            "category": "Roads", # Used for transport infrastructure
            "language": "en",
            "priority_score": 60,
            "sentiment": "Neutral",
            "urgency": "Medium",
            "explanation": "Important for public convenience but not an immediate life safety threat."
        },
        {
            "title": "Frequent Power Cuts in Chembur",
            "description": "Power goes off for 2-3 hours every afternoon, affecting work from home and students.",
            "category": "Electricity",
            "language": "en",
            "priority_score": 75,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Economic impact and disruption of daily life for a large residential area."
        },
        {
            "title": "Primary school roof leaking in Ghatkopar",
            "description": "Water leaking into classrooms during rains, students cannot sit in two classes.",
            "category": "Education",
            "language": "en",
            "priority_score": 82,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Impacting education of children; structural risk."
        },
        {
            "title": "Pipeline burst wasting clean water in Malad",
            "description": "Thousands of liters of drinking water flowing onto the road near the station.",
            "category": "Water Supply",
            "language": "en",
            "priority_score": 92,
            "sentiment": "Negative",
            "urgency": "Critical",
            "explanation": "Massive resource wastage requires immediate emergency repair."
        },
        {
            "title": "Blocked drainage causing flooding in Dadar",
            "description": "Knee-deep water accumulation due to blocked storm water drains.",
            "category": "Sanitation",
            "language": "en",
            "priority_score": 89,
            "sentiment": "Negative",
            "urgency": "High",
            "explanation": "Property damage risk and disease vector breeding ground."
        }
    ]

    for data in issues_data:
        # Generate random coordinates around Mumbai for the heatmap
        lat = mumbai_center_lat + random.uniform(-0.15, 0.15)
        lon = mumbai_center_lon + random.uniform(-0.15, 0.15)
        
        issue = models.IssueModel(
            id=str(uuid.uuid4()),
            title=data["title"],
            description=data["description"],
            category=data["category"],
            latitude=lat,
            longitude=lon,
            language=data["language"],
            priority_score=data["priority_score"],
            sentiment=data["sentiment"],
            urgency=data["urgency"],
            explanation=data["explanation"],
            created_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(0, 5)),
            status=random.choice(["Open", "Open", "Open", "Closed"]) # 75% open
        )
        db.add(issue)
        
    db.commit()
    print("Database seeded with realistic Mumbai constituency data.")
    db.close()

if __name__ == "__main__":
    seed_db()
