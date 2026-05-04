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

# Prompt 
def build_prompt(emails):
    return f"""
You are an AI email assistant.

For EACH email return:
- id
- category: Urgent | Important | Low Priority | Spam
- urgency_score (0-100)
- importance_score (0-100)
- summary (1 sentence)
- action
- suggested_reply (or null)

Return ONLY valid JSON array. No explanation. No markdown.

Emails:
{json.dumps([e.dict() for e in emails])}
"""

# API 
@app.post("/analyze-emails")
def analyze_emails(emails: List[Email]):

    prompt = build_prompt(emails)

    response = client.chat.completions.create(
    model="llama-3.1-8b-instant",
    messages=[
        {"role": "user", "content": prompt}
    ],
    temperature=0.2
    )

    raw = response.choices[0].message.content

    print("RAW OUTPUT:", raw)

    try:
        return json.loads(raw)
    except:
        return {
            "error": "Failed to parse JSON",
            "raw_output": raw
        }
