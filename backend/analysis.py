def analyze_writing(perplexity, burstiness, word_count):
    if word_count < 50:
        return {
            "analysis": "Text too short for reliable analysis.",
            "confidence":None
        }
    if perplexity < 20 and burstiness < 4:
        return {
            "analysis": "Text appears more AI-like due to low perplexity and uniform sentence structure.",
            "confidence": "medium"
        }
    
    if perplexity > 30 and burstiness > 5:
        return {
            "analysis": "Text appears more human-like due to higher unpredictability and sentence variation.",
            "confidence": "medium"
        }
    
    return {
        "analysis": "Text contains mixed statistical signals.",
        "confidence": "low"
    }