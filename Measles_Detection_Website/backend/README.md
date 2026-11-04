# Backend: Multimodal Inference & Explainability Service

Asynchronous microservice built with **FastAPI** and **Uvicorn** to serve the multimodal deep learning measles classification model (MobileNetV2 + 5 clinical symptom features) and compute exact game-theoretic SHAP attributions.

---

## Technical Specifications

- **Framework**: FastAPI (v0.100+) on Uvicorn ASGI server with uvloop
- **Deep Learning**: TensorFlow (v2.12+) / Keras Functional API
- **Vision Backbone**: MobileNetV2 pre-trained on ImageNet-1k (16 inverted residual blocks, $224 \times 224 \times 3$ RGB input)
- **Clinical Branch**: Multi-Layer Perceptron (Dense 32 $\to$ Dense 16) ingesting 5 binary prodromal symptoms
- **Fusion Layer**: Concatenation ($128 + 16 = 144$ dimensions) $\to$ Dense(64) + Dropout(0.3) $\to$ Dense(1, Sigmoid)
- **Explainable AI (XAI)**: Exact Shapley Additive Explanations evaluated across all $2^5 = 32$ feature subsets

---

## Project Structure

```text
backend/
├── main.py              # FastAPI application, model loader, and Exact SHAP evaluator
├── requirements.txt     # Python dependencies
├── Dockerfile           # Production container configuration
├── models/
│   ├── measles_multimodal_model.keras  # Serialized model weights (9.28 MB)
│   └── README.md                       # Model weight specifications
└── README.md            # Backend service documentation
```

---

## Quick Start

### 1. Set Up Python Virtual Environment
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Verify Model Weights
Ensure `measles_multimodal_model.keras` is placed inside `backend/models/`:
```text
backend/models/measles_multimodal_model.keras
```

### 4. Launch the Service
```bash
uvicorn main:app --reload --port 8000
```

---

## API Endpoints

### 1. `POST /predict`
Performs multimodal inference and computes exact SHAP attributions.

- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `image`: Binary image file (JPEG, PNG, or WEBP)
  - `fever`: Integer (0 or 1) — High temperature $\ge 38.5^\circ\text{C}$
  - `cough`: Integer (0 or 1) — Persistent cough
  - `red_eyes`: Integer (0 or 1) — Conjunctivitis / photophobia
  - `koplik_spots`: Integer (0 or 1) — Pathognomonic buccal mucosa lesions
  - `vaccinated`: Integer (0 or 1) — MMR vaccination history
- **Response**: JSON containing:
  - `prediction`: `"Measles"` or `"Normal"`
  - `probability`: Float $\in [0.0, 1.0]$
  - `image_branch_score`: Float visual signal representation
  - `clinical_branch_score`: Float clinical symptom burden
  - `xai`: Exact SHAP attributions array, base value prior, and Grad-CAM base64 artifacts

### 2. `GET /health`
Returns service status, model memory allocation, and execution mode:
```json
{
  "status": "ok",
  "model_loaded": true,
  "model_load_error": null,
  "mode": "trained_weights"
}
```

### 3. `GET /docs`
Interactive OpenAPI / Swagger UI documentation for manual endpoint testing.
