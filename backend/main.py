from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Data model
class Email(BaseModel):
    id: int
    subject: str
    body: str
    sender: str

# Improved prompt 
def build_prompt(emails):
    return f"""
You are an AI email assistant. Analyze each email and provide a structured response.

For EACH email return a JSON object with:
- id (integer)
- category: MUST be one of: "Urgent" | "Important" | "Low Priority" | "Spam"
- urgency_score (integer 0-100)
- importance_score (integer 0-100)
- summary (string, 1 sentence)
- action (string, what the user needs to do)
- suggested_reply (string or null) - Generate a reply for emails that ask questions, request information, require confirmation, or need a response. For spam, newsletters, or purely informational emails, use null.

Guidelines for suggested_reply:
- Create helpful, context-aware replies for emails that need a response
- For questions: answer appropriately
- For requests: acknowledge and respond
- For meeting invites: confirm availability or propose alternatives
- For action items: confirm you'll take action
- Keep replies concise (1-3 sentences)
- Don't generate replies for spam, newsletters, automated alerts, or purely FYI emails

Examples of when to generate a reply:
- "Can you send the files?" -> Generate: "Thanks for following up. I'll send those files over right away."
- "Are you free for lunch?" -> Generate: "Lunch sounds great! What time works best for you?"
- "Can you review this?" -> Generate: "I'll review the document and get back to you by tonight."

Examples of when to use null:
- Newsletters or promotional emails
- Security alerts
- Payment reminders (action is to pay, not reply)
- Calendar reminders
- System notifications

Return ONLY valid JSON array. No explanation. No markdown. Example format:
[
  {{
    "id": 1,
    "category": "Important",
    "urgency_score": 75,
    "importance_score": 80,
    "summary": "Reminder for final interview tomorrow at 10 AM.",
    "action": "Prepare for and attend the interview",
    "suggested_reply": null
  }},
  {{
    "id": 2,
    "category": "Low Priority",
    "urgency_score": 30,
    "importance_score": 20,
    "summary": "Friend asking about lunch tomorrow.",
    "action": "Respond with availability",
    "suggested_reply": "Lunch sounds great! I'm free around noon. Where would you like to meet?"
  }}
]

Emails to analyze:
{json.dumps([e.dict() for e in emails], indent=2)}
"""

# API 
@app.post("/analyze-emails")
def analyze_emails(emails: List[Email]):

    prompt = build_prompt(emails)

    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "system", "content": "You are an AI email assistant that returns only valid JSON arrays. Never include explanatory text or markdown formatting."},
        {"role": "user", "content": prompt}
    ],
    temperature=0.3
    )

    raw = response.choices[0].message.content

    print("RAW OUTPUT:", raw)
    
    # Clean up the response if it contains markdown
    raw = raw.strip()
    if raw.startswith('```json'):
        raw = raw[7:]
    if raw.startswith('```'):
        raw = raw[3:]
    if raw.endswith('```'):
        raw = raw[:-3]
    raw = raw.strip()

    try:
        parsed = json.loads(raw)
        return parsed
    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {e}")
        return {
            "error": "Failed to parse JSON",
            "raw_output": raw
        }
