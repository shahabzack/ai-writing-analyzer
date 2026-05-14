from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re

from perplexity import calculate_perplexity
from burstiness import calculate_burstiness
from analysis import analyze_writing

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    {"message":"API running"}


class TextRequest(BaseModel):
    text:str

@app.post("/analyze")
def analyze_text(data: TextRequest):
    text = data.text
    sentences = re.split(r"[.!?]+",text)
    sentences = [s for s in sentences if s.strip()] # empty remove

    words = re.findall(r'\b\w+\b', text)

    perplexity_score = calculate_perplexity(text)
    burstiness_score = calculate_burstiness(text)

    analysis_result = analyze_writing(
    perplexity_score,
    burstiness_score,
    len(words)
)

    return {
        "sentence_count":len(sentences),
        "word_count" : len(words),
        "perplexity":perplexity_score,
        "burstiness":burstiness_score,
        "analysis":analysis_result['analysis'],
        "confidence":analysis_result["confidence"]
    }


