from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel
import re
import csv
import logging

from perplexity import calculate_perplexity
from burstiness import calculate_burstiness
from analysis import analyze_writing

app = FastAPI()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message":"API running"}


class TextRequest(BaseModel):
    text:str

class FeedbackRequest(BaseModel):
    text:str
    label : str
    perplexity:float
    burstiness: float

@app.post("/analyze")
def analyze_text(data: TextRequest):

    try:

        logger.info("Analysis request received")

        text = data.text

        sentences = re.split(r"[.!?]+", text)
        sentences = [s for s in sentences if s.strip()]

        words = re.findall(r'\b\w+\b', text)

        perplexity_score = calculate_perplexity(text)
        burstiness_score = calculate_burstiness(text)

        analysis_result = analyze_writing(
            perplexity_score,
            burstiness_score,
            len(words)
        )

        logger.info("Analysis completed successfully")

        return {
            "sentence_count": len(sentences),
            "word_count": len(words),
            "perplexity": perplexity_score,
            "burstiness": burstiness_score,
            "analysis": analysis_result['analysis'],
            "confidence": analysis_result["confidence"]
        }

    except Exception as e:

        logger.error(f"Analysis failed: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to analyze text"
        )
    
    
@app.post("/save_feedback")
def save_feedback(data: FeedbackRequest):

    try:

        with open(
            "dataset.csv",
            "a",
            newline="",
            encoding="utf-8"
        ) as file:

            writer = csv.writer(file)

            writer.writerow([
                data.text,
                data.label,
                data.perplexity,
                data.burstiness
            ])

        logger.info("Feedback saved successfully")

        return {
            "message": "Feedback saved"
        }

    except Exception as e:

        logger.error(f"Error saving feedback: {str(e)}")

        raise HTTPException(
            status_code=500,
            detail="Failed to save feedback"
        )


