# Multimodal Deep Learning and Explainable Artificial Intelligence for Measles Detection

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![TensorFlow 2.12+](https://img.shields.io/badge/TensorFlow-2.12+-orange.svg)](https://www.tensorflow.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)](https://fastapi.tiangolo.com/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite 8](https://img.shields.io/badge/Vite-8-purple.svg)](https://vitejs.dev/)

Official replication repository for the research paper:  
**"Measles Detection Using Multimodal Deep Learning and Explainable Artificial Intelligence (XAI)"**.

---

## Abstract

Measles (*Rubeola*) is an acute, highly contagious viral disease with severe potential complications. Automated computer-aided diagnosis based solely on photographic skin lesion examination often struggles with visual ambiguity against other pediatric febrile exanthems (e.g., rubella, roseola, scarlet fever). 

This research proposes an end-to-end multimodal deep learning framework that concurrently ingests:
1. **Dermatological Skin Imagery** processed via a lightweight, pre-trained **MobileNetV2** convolutional backbone (depthwise separable convolutions).
2. **Structured Clinical Features** (Fever $\ge 38.5^\circ\text{C}$, Cough, Conjunctivitis / Red Eyes, Koplik Spots, and MMR Vaccination History) evaluated through a Multi-Layer Perceptron (MLP) branch.

To address the "black-box" nature of neural network decisions in clinical environments, the framework integrates **Exact Shapley Additive Explanations (Exact SHAP)** computed across all $2^5 = 32$ combinatorial clinical symptom coalitions, guaranteeing the mathematical axioms of Efficiency, Symmetry, and Additivity. The system is provided as a full-stack clinical decision-support application (FastAPI backend and React 19 frontend).

```
                             MULTIMODAL SYSTEM ARCHITECTURE
                 
   [ Skin Image: 224x224x3 ]                      [ 5 Clinical Symptoms (Binary) ]
               │                                                 │
    [ MobileNetV2 Backbone ]                             [ Dense Layer: 32 ]
  (16 Inverted Residual Blocks)                                  │
               │                                         [ Dense Layer: 16 ]
    [ GlobalAveragePooling2D ]                                   │
               │                                                 │
      [ Dense Layer: 128 ]                                       │
               │                                                 │
               └───────────────────────┬─────────────────────────┘
                                       │
                           [ Concatenation: 144 dims ]
                                       │
                              [ Dense Layer: 64 ]
                                       │
                              [ Dropout Rate: 0.3 ]
                                       │
                         [ Output: Dense(1, Sigmoid) ]
                                       │
                         ──> Measles Probability P(Y=1)
                                       │
               ┌───────────────────────┴─────────────────────────┐
               │                                                 │
       [ Binary Decision ]                             [ Exact SHAP Engine ]
      Measles vs. Normal                       Evaluates all 2^5 = 32 Coalitions
```

---

## Key Features

- **Multimodal Deep Fusion**: Fuses visual rash representations with clinical history, significantly improving discriminative performance over unimodal baselines.
- **Exact SHAP Attribution**: Because the clinical feature vector has length $n = 5$, attributions are solved analytically across all 32 power set coalitions rather than relying on Monte Carlo sampling approximations.
- **Parameter Efficiency**: MobileNetV2 backbone achieves high diagnostic accuracy with only 2.43M total trainable parameters ($9.28\text{ MB}$ weight footprint).
- **Interactive Clinical Interface**: React 19 single-page application with immediate diagnostic reporting, directional SHAP attribution bars, and patient risk breakdown.
- **Stateless Privacy-Preserving API**: FastAPI backend processes inputs in-memory without logging or storing patient imagery.

---

## Repository Structure

```text
Measles_Detection_Website/
├── backend/
│   ├── models/
│   │   ├── measles_multimodal_model.keras  # Trained multimodal network weights
│   │   └── README.md                       # Model weight specifications
│   ├── main.py                             # FastAPI service & Exact SHAP evaluator
│   ├── requirements.txt                    # Python runtime dependencies
│   ├── Dockerfile                          # Containerized deployment manifest
│   └── README.md                           # Backend documentation
├── frontend/
│   ├── public/                             # Public static assets and sample data
│   ├── src/
│   │   ├── components/                     # Reusable UI components (Navbar, Footer, ImageUpload)
│   │   ├── pages/                          # Application views (Home, Detection, Result, XAIDashboard)
│   │   ├── App.jsx                         # Application router setup
│   │   ├── index.css                       # Design system and layout styles
│   │   └── main.jsx                        # React root entry point
│   ├── package.json                        # Frontend dependencies and scripts
│   ├── vite.config.js                      # Vite build configuration
│   ├── vercel.json                         # SPA routing rewrite configuration
│   └── README.md                           # Frontend documentation
├── .gitignore                              # Comprehensive version control ignore rules
├── CITATION.cff                            # Academic citation metadata
├── LICENSE                                 # MIT License
└── README.md                               # Primary project documentation
```

---

## Experimental Performance Summary

Evaluated on a stratified test holdout ($75/15/15$ train/validation/test split):

| Metric | Multimodal (Proposed) | Image-Only Baseline | Clinical-Only Baseline |
| :--- | :---: | :---: | :---: |
| **Accuracy** | **97.6%** | 93.6% | 91.2% |
| **Precision** | **98.4%** | 94.1% | 92.5% |
| **Recall / Sensitivity** | **96.9%** | 91.5% | 89.4% |
| **F1-Score** | **97.7%** | 92.5% | 90.9% |

---

## Installation & Reproduction Guide

### Prerequisites
- **Python**: Version 3.10 or higher
- **Node.js**: Version 20.x or higher (`npm` 10.x+)
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create and activate a Python virtual environment
python3 -m venv .venv
source .venv/bin/activate       # On Windows: .venv\Scripts\activate

# Install required packages
pip install -r requirements.txt

# Start the FastAPI development server
uvicorn main:app --reload --port 8000
```

The backend API will be accessible at:
- **API Root**: `http://localhost:8000/`
- **Interactive Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`

---

### 2. Frontend Setup

In a separate terminal window:

```bash
# Navigate to the frontend directory
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The client application will launch at:
- **Local Interface**: `http://localhost:5173/`

---

## Explainable AI (Exact SHAP) Formulation

For clinical feature attribution, the platform computes the exact Shapley value for each symptom $i \in F$ where $F = \{\text{Fever, Cough, Red\_eyes, Koplik\_spots, Vaccinated}\}$:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \Big[ f_{x}(S \cup \{i\}) - f_{x}(S) \Big]$$

Where:
- $F$ is the complete set of clinical symptoms ($|F| = 5$).
- $S$ is a subset coalition of symptoms excluding symptom $i$.
- $f_x(S)$ is the model expectation conditioned on the observed patient values for features in $S$ while marginalizing excluded symptoms across population reference priors:
  $$\mathbf{b} = [0.30,\, 0.30,\, 0.30,\, 0.10,\, 0.80]^T$$

This formulation guarantees:
- **Efficiency**: $\sum_{i=1}^{5} \phi_i = f(x) - \mathbb{E}[f(X)]$.
- **Symmetry**: Identical contributors receive equal attribution.
- **Null Player**: A symptom with zero marginal gain receives $\phi_i = 0$.

---

## Citation

If you use this codebase, model architecture, or methodology in your research, please cite:

```bibtex
@article{measles_multimodal_2026,
  title     = {Measles Detection Using Multimodal Deep Learning and Explainable Artificial Intelligence (XAI)},
  author    = {Research Author and Collaborators},
  journal   = {Peer-Reviewed Journal / Conference Submission},
  year      = {2026},
  volume    = {},
  pages     = {},
  doi       = {}
}
```

---

## Disclaimer

- **Research Disclaimer**: This software is an academic research prototype designed to validate multimodal machine learning and interpretability methodologies. It is not certified as a medical device for standalone clinical diagnosis.
