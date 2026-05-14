from transformers import GPT2LMHeadModel,GPT2TokenizerFast
import torch
import math

model_name = "gpt2"

tokenizer = GPT2TokenizerFast.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

# Perplexity

def calculate_perplexity(text):
    inputs = tokenizer(text,return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs,labels=inputs["input_ids"])
    
    loss = outputs.loss

    perplexity = math.exp(loss.item())
    
    if math.isnan(perplexity):
        return 0
    return round(perplexity,2)
