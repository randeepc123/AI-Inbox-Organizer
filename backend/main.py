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

# Improved prompt that preserves original IDs and subjects
def build_prompt(emails):
    return f"""
You are an AI email assistant. Analyze each email and provide a structured response.

IMPORTANT: Preserve the original 'id' from the input email in your output.

For EACH email return a JSON object with:
- id (integer) - MUST match the original email's id
- original_subject (string) - include the original email subject for reference
- category: MUST be one of: "Urgent" | "Important" | "Low Priority" | "Spam"
- urgency_score (integer 0-100)
- importance_score (integer 0-100)
- summary (string, 1 sentence)
- action (string, what the user needs to do)
- suggested_reply (string or null) - Generate a reply for emails that ask questions, request information, require confirmation, or need a response.

Guidelines for suggested_reply:
- Create helpful, context-aware replies for emails that need a response
- For questions: answer appropriately
- For requests: acknowledge and respond
- Keep replies concise (1-3 sentences)
- Don't generate replies for spam, newsletters, automated alerts

Return ONLY valid JSON array. No explanation. No markdown.

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
        {"role": "system", "content": "You are an AI email assistant that returns only valid JSON arrays. Always preserve the original email IDs. Never include explanatory text or markdown formatting."},
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
