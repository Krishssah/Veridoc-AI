from importlib import import_module
import os


def extract_text(image_path):
    try:
        # Import libraries
        pytesseract = import_module("pytesseract")
        cv2 = import_module("cv2")

        # Tesseract installation path
        tesseract_path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

        # Check Tesseract
        if not os.path.exists(tesseract_path):
            print("ERROR: Tesseract not found.")
            return "Tesseract OCR engine not found."

        # Tell pytesseract where Tesseract is installed
        pytesseract.pytesseract.tesseract_cmd = tesseract_path

        # Check input image
        if not os.path.exists(image_path):
            print("ERROR: Image does not exist:", image_path)
            return "Document image not found."

        # Read image
        image = cv2.imread(image_path)

        if image is None:
            print("ERROR: OpenCV could not read image.")
            return "Could not load document image."

        # Convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Enlarge image for better OCR
        gray = cv2.resize(
            gray,
            None,
            fx=2,
            fy=2,
            interpolation=cv2.INTER_CUBIC
        )

        # Remove small noise
        gray = cv2.GaussianBlur(
            gray,
            (3, 3),
            0
        )

        # Convert to black and white
        processed = cv2.threshold(
            gray,
            0,
            255,
            cv2.THRESH_BINARY + cv2.THRESH_OTSU
        )[1]

        # Run OCR
        text = pytesseract.image_to_string(
            processed,
            lang="eng",
            config="--psm 6"
        )

        # Clean result
        text = text.strip()

        if not text:
            print("OCR completed but no text was detected.")
            return "No readable text detected."

        print("OCR completed successfully.")

        return text

    except Exception as e:
        print("OCR ERROR:", type(e).__name__, str(e))
        return "Unable to read image."