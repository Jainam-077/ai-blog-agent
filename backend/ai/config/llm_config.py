import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# Models
FAST_MODEL   = "llama-3.1-8b-instant"   # outline, planning
WRITER_MODEL = "llama-3.1-8b-instant"   # blog writing


def get_llm(temperature=0.7, fast=False, max_tokens=None):
    key = os.getenv("GROQ_API_KEY")

    if not key:
        raise ValueError("GROQ_API_KEY missing from .env")

    default_max = 1536 if fast else 1024
    return ChatGroq(
        model=FAST_MODEL if fast else WRITER_MODEL,
        temperature=temperature,
        groq_api_key=key,
        max_tokens=max_tokens if max_tokens is not None else default_max,
    )