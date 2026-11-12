# VERIDOC AI
# AI-Based Fake Identity and Document Screening System

VERIDOC AI is an AI-powered document verification system designed to assist in identifying potentially fake, forged, and tampered identity documents. It combines Optical Character Recognition (OCR), Computer Vision, and Convolutional Neural Networks (CNN) to analyze documents and generate a risk score for smarter identity screening.

# Key Features

- **OCR Processing:** Extracts relevant information from uploaded documents.
- **CNN-Based Detection:** Uses a deep learning model to analyze document images.
- **Document Verification:** Checks document information for potential inconsistencies.
- **Risk Scoring:** Generates a risk score to help identify suspicious documents.
- **Web Dashboard:** Provides a simple interface for document submission and analysis.

# Technology Stack

| Technology | Purpose |
|---|---|
| Python | Core programming |
| Flask | Web application |
| PyTorch | CNN model |
| OpenCV | Image processing |
| Tesseract OCR | Text extraction |
| HTML, CSS, JavaScript | Frontend |

# Project Workflow

1. Upload an identity document.
2. Extract text using OCR.
3. Analyze the document image using the CNN model.
4. Perform document consistency checks.
5. Generate a risk score and display the result.

# Project Structure

```text
VERIDOC-AI/
├── models/
│   └── document_cnn.pth
├── services/
│   ├── cnn_detector.py
│   ├── document_check.py
│   ├── ocr.py
│   └── risk_score.py
├── static/
│   ├── script.js
│   └── style.css
├── templates/
│   └── index.html
├── app.py
├── requirements.txt
├── test_model.py
├── train_cnn.py
└── README.md
```

# Installation and Setup

**1. Clone the repository**

```bash
git clone https://github.com/Krishssah/Veridoc-AI.git
cd Veridoc-AI
```

**2. Create a virtual environment**

```bash
python -m venv venv
```

**3. Activate the environment**

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

**4. Install dependencies**

```bash
pip install -r requirements.txt
```

*5. Run the application**

```bash
python app.py
```

Open the following address in your browser:

`http://127.0.0.1:5000`

# Model Training

To train the CNN model using the configured dataset:

```bash
python train_cnn.py
```

# Project Objective

The objective of VERIDOC AI is to explore how Artificial Intelligence, OCR, and Computer Vision can support automated identity document screening and help reduce the effort involved in manual verification.

# Future Improvements

- Improve CNN accuracy using larger and more diverse datasets.
- Add advanced document tampering detection.
- Integrate secure identity verification APIs.
- Improve explainability of suspicious-document results.
- Enhance model evaluation and performance.

# Disclaimer

VERIDOC AI is an academic project and a prototype for identity document screening. Its predictions and risk scores are intended as decision-support signals, not definitive proof of document fraud or a replacement for official verification.

## Developed By

**VERIDOC AI Project Team – AgenticApex**
