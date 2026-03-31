import os
import base64
import json
import re
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Dental X-Ray AI Diagnosis API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY environment variable is not set")

client = Groq(api_key=GROQ_API_KEY)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MODEL = "meta-llama/llama-4-scout-17b-16e-instruct"

CAVITY_PROMPT = """You are a dental radiologist. Analyze this bitewing X-ray. Identify all areas showing potential cavities, interproximal decay, or bone loss. For each finding return: tooth region (use FDI notation if possible), condition name, confidence score 0-100, severity (low/moderate/high), and a one-sentence clinical description.

Return ONLY a valid JSON array with no other text or markdown:
[{"region": "FDI notation or region", "condition": "condition name", "confidence": 85, "severity": "moderate", "description": "clinical description"}]

If no pathology is detected, return: []"""

SECOND_OPINION_PROMPT = """You are an expert dental radiologist providing a second opinion. Analyze this X-ray and provide a differential diagnosis. List all possible conditions you observe, ranked by confidence score from highest to lowest.

Return ONLY a valid JSON array with no other text or markdown:
[{"region": "affected region", "condition": "condition name", "confidence": 85, "severity": "moderate", "description": "supporting evidence and clinical notes"}]

Rank entries by confidence descending. If no pathology is detected, return: []"""

PERIAPICAL_PROMPT = """You are a dental radiologist specializing in periapical pathology. Analyze this periapical X-ray for signs of: periapical infection, abscess formation, root resorption (internal or external), widened periodontal ligament space, or bone rarefaction.

Return ONLY a valid JSON array with no other text or markdown:
[{"region": "affected tooth region", "condition": "condition name", "confidence": 85, "severity": "early", "description": "clinical recommendation"}]

Severity must be one of: early, moderate, advanced. If no pathology is detected, return: []"""


def validate_image(file: UploadFile, content: bytes) -> None:
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Accepted: JPEG, PNG, WebP.",
        )
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Image exceeds maximum allowed size of 10 MB.",
        )


def extract_json(text: str) -> list:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\n?", "", text)
    text = re.sub(r"\n?```$", "", text)
    text = text.strip()
    try:
        match = re.search(r"\[[\s\S]*\]", text)
        if match:
            return json.loads(match.group())
        return json.loads(text)
    except (json.JSONDecodeError, AttributeError):
        return []


async def call_groq(image_bytes: bytes, content_type: str, prompt: str) -> list:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")
    media_type = content_type if content_type in ALLOWED_CONTENT_TYPES else "image/jpeg"
    try:
        response = client.chat.completions.create(
            model=MODEL,
            max_tokens=2048,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{media_type};base64,{image_b64}",
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )
        return extract_json(response.choices[0].message.content)
    except Exception as e:
        err = str(e)
        if "401" in err or "invalid_api_key" in err.lower() or "authentication" in err.lower():
            raise HTTPException(status_code=401, detail="Invalid Groq API key.")
        if "429" in err or "rate_limit" in err.lower():
            raise HTTPException(status_code=429, detail="Groq rate limit exceeded. Please retry shortly.")
        raise HTTPException(status_code=502, detail=f"AI service error: {err}")


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL, "provider": "groq"}


@app.post("/analyze/cavity")
async def analyze_cavity(image: UploadFile = File(...)):
    content = await image.read()
    validate_image(image, content)
    findings = await call_groq(content, image.content_type, CAVITY_PROMPT)
    return {"findings": findings, "analysis_type": "cavity", "count": len(findings)}


@app.post("/analyze/second-opinion")
async def analyze_second_opinion(image: UploadFile = File(...)):
    content = await image.read()
    validate_image(image, content)
    findings = await call_groq(content, image.content_type, SECOND_OPINION_PROMPT)
    return {"findings": findings, "analysis_type": "second_opinion", "count": len(findings)}


@app.post("/analyze/periapical")
async def analyze_periapical(image: UploadFile = File(...)):
    content = await image.read()
    validate_image(image, content)
    findings = await call_groq(content, image.content_type, PERIAPICAL_PROMPT)
    return {"findings": findings, "analysis_type": "periapical", "count": len(findings)}
