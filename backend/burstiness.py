import re
import statistics
import math

def calculate_burstiness(text):
    sentences = re.split(r"[.!?]+",text)
    sentences = [s for s in sentences if s.strip()]

    sentence_length = [
        len(sentence.split())
        for sentence in sentences
    ]
    

    if len(sentence_length) < 2:
        return 0
    
    burstiness_score = statistics.stdev(sentence_length)

    if math.isnan(burstiness_score):
        return 0

    return round(burstiness_score,2)

