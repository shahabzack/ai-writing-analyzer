from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from pydantic import BaseModel

import re
import csv
import logging
import joblib

from feature_extraction import extract_features


app = FastAPI()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


model = joblib.load(
    "../analysis/outputs/ai_text_detector_model.pkl"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "API running"
    }


class TextRequest(BaseModel):
    text: str


class FeedbackRequest(BaseModel):
    text: str
    label: str

    perplexity: float
    burstiness: float

    avg_sentence_length: float
    vocabulary_diversity: float


@app.post("/analyze")
def analyze_text(data: TextRequest):

    try:

        logger.info("Analysis request received")

        text = data.text

        sentences = re.split(r"[.!?]+", text)
        sentences = [s for s in sentences if s.strip()]

        words = re.findall(r"\b\w+\b", text)

        features = extract_features(text)

        feature_values = [[
            features["perplexity"],
            features["burstiness"],
            features["avg_sentence_length"],
            features["vocabulary_diversity"]
        ]]

        prediction = model.predict(feature_values)[0]

        confidence = max(
            model.predict_proba(feature_values)[0]
        )

        logger.info("Analysis completed successfully")

        return {

            "sentence_count": len(sentences),
            "word_count": len(words),

            "perplexity": features["perplexity"],
            "burstiness": features["burstiness"],
            "avg_sentence_length": features["avg_sentence_length"],
            "vocabulary_diversity": features["vocabulary_diversity"],

            "prediction": prediction,
            "confidence": round(confidence * 100, 2)
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
                data.burstiness,

                data.avg_sentence_length,
                data.vocabulary_diversity
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