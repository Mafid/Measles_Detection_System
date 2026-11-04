# Trained Model Weights

This directory contains the serialized model artifacts for the multimodal measles detection network.

## Primary Model File
- **File**: `measles_multimodal_model.keras`
- **Format**: Native Keras v3 archive (`.keras` format)
- **Size**: Approximately 9.28 MB (2,432,017 parameters)
- **Inputs**:
  - `image_input`: Tensor of shape `(None, 224, 224, 3)` normalized to `[-1.0, 1.0]`
  - `metadata_input`: Tensor of shape `(None, 5)` representing binary clinical symptoms:
    `[Fever, Cough, Red_eyes, Koplik_spots, Vaccinated]`
- **Output**: Sigmoid activation scalar representing posterior measles probability $P(Y=1) \in [0.0, 1.0]$

The backend service (`main.py`) automatically discovers and loads this file upon server initialization.
