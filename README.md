# DentalAI — X-Ray Diagnosis Assistant

AI-powered dental radiograph analysis using Claude Vision. Three analysis modules:
- **Cavity Detector** — caries, interproximal decay, bone loss
- **Second Opinion** — differential diagnosis ranked by confidence
- **Periapical Analysis** — infection, abscess, root resorption, bone rarefaction

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Quick Start

### 1. Clone / extract the project

```bash
cd c:/Softwares/Dentist
```

### 2. Backend setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY=sk-ant-...

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

### 3. Frontend setup

```bash
cd frontend

# Install dependencies
npm install

# (Optional) Configure backend URL
cp .env.example .env
# Edit VITE_API_URL if your backend runs on a different host/port

# Start the dev server
npm run dev
```

App will be available at: http://localhost:5173

---

## Project Structure

```
Dentist/
├── backend/
│   ├── main.py              FastAPI app with 3 analysis endpoints
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── App.jsx          Root app + tab navigation
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── AnalysisModule.jsx   Shared analysis layout (all 3 tabs)
│   │   │   ├── ImageUploadZone.jsx  Drag-and-drop uploader
│   │   │   ├── XRayViewer.jsx       Image + canvas overlay
│   │   │   ├── FindingsSidebar.jsx  Findings list panel
│   │   │   └── FindingCard.jsx      Individual finding with confirm/dismiss
│   │   └── utils/
│   │       └── pdf.js               jsPDF report generator
│   └── .env.example
└── .env.example
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/analyze/cavity` | Cavity + bone loss detection |
| POST | `/analyze/second-opinion` | Differential diagnosis |
| POST | `/analyze/periapical` | Periapical pathology analysis |

All `POST` endpoints accept `multipart/form-data` with an `image` field (JPEG / PNG / WebP, max 10 MB).

**Response schema:**
```json
{
  "findings": [
    {
      "region": "FDI notation or description",
      "condition": "Mesial caries",
      "confidence": 87,
      "severity": "moderate",
      "description": "Interproximal radiolucency suggesting dentinal involvement."
    }
  ],
  "analysis_type": "cavity",
  "count": 1
}
```

---

## Features

- Drag-and-drop X-ray upload (JPEG / PNG / WebP)
- AI overlay with colour-coded elliptical markers (red = high, amber = moderate, green = low)
- Click markers on the image to highlight the corresponding finding in the sidebar
- Confirm or dismiss each AI finding before saving
- Export structured PDF report (patient name, date, X-ray image, all findings)
- Responsive layout — works on tablet displays

---

## Configuration

| Variable | Location | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | `backend/.env` | Your Anthropic API key |
| `VITE_API_URL` | `frontend/.env` | Backend base URL (default: `http://localhost:8000`) |

---

## Production Build

```bash
# Frontend
cd frontend && npm run build   # outputs to frontend/dist/

# Backend (production server)
cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 --workers 2
```

---

## Notes

- The AI model used is `claude-sonnet-4-6`. Update the `MODEL` constant in `backend/main.py` to switch models.
- Overlay markers are placed at deterministic positions since Claude returns text-based region descriptions rather than pixel coordinates. Real bounding boxes would require a dedicated object-detection model fine-tuned on dental radiographs.
- This tool is intended as a clinical decision-support aid. All findings must be reviewed by a qualified dental professional.
