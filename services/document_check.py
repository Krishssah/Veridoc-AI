import importlib


def analyze_document(image_path, extracted_text):

    try:
        cv2 = importlib.import_module("cv2")
        image = cv2.imread(image_path)
    except (ImportError, OSError):
        image = None

    if image is None:
        return {
            "image_quality": "Poor",
            "text_found": False,
            "possible_tampering": True
        }

    height, width = image.shape[:2]

    # Basic image-quality check
    if width >= 600 and height >= 400:
        image_quality = "Good"
    else:
        image_quality = "Low"

    # Check whether OCR found meaningful text
    text_found = len(extracted_text.strip()) > 20

    # Placeholder for advanced CNN/tampering model
    possible_tampering = False

    return {
        "image_quality": image_quality,
        "text_found": text_found,
        "possible_tampering": possible_tampering
    }