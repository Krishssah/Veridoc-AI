def calculate_risk(analysis):
    score = 0

    # IMAGE QUALITY
    if analysis.get("image_quality") == "Low":
        score += 20

    # OCR SIGNAL
    if not analysis.get("text_found", False):
        score += 30

    # TAMPERING SIGNAL
    if analysis.get("possible_tampering", False):
        score += 30

    # CNN SIGNAL
    # CNN is only a supporting signal.
    # It must NOT decide that a document is fake by itself.
    cnn_prediction = analysis.get("cnn_prediction", "")
    cnn_confidence = float(
        analysis.get("cnn_confidence", 0)
    )

    if (
        cnn_prediction == "Potentially Fake"
        and cnn_confidence >= 70
    ):
        score += 10

    # Keep score between 0 and 100
    score = min(score, 100)

    if score < 30:
        level = "LOW"
    elif score < 60:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return {
        "score": score,
        "level": level
    }