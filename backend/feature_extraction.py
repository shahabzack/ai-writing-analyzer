from perplexity import calculate_perplexity
from burstiness import calculate_burstiness
import re

def average_sentence_length(text):

    sentences = re.split(r"[.!?]+", text)
    sentences = [s for s in sentences if s.strip()]

    if len(sentences) == 0:
        return 0

    words = re.findall(r"\b\w+\b", text)

    return round(len(words) / len(sentences), 2)


def vocabulary_diversity(text):

    words = re.findall(r"\b\w+\b", text.lower())

    if len(words) == 0:
        return 0

    unique_words = set(words)

    return round(len(unique_words) / len(words), 2)


def extract_features(text):

    perplexity = calculate_perplexity(text)

    burstiness = calculate_burstiness(text)

    avg_sentence_len = average_sentence_length(text)

    vocab_diversity = vocabulary_diversity(text)

    return {
        "perplexity": perplexity,
        "burstiness": burstiness,
        "avg_sentence_length": avg_sentence_len,
        "vocabulary_diversity": vocab_diversity
    }