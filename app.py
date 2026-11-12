from importlib import import_module
import os
import uuid

flask = import_module("flask")
Flask = flask.Flask
render_template = flask.render_template
request = flask.request
jsonify = flask.jsonify

extract_text = import_module("services.ocr").extract_text
analyze_document = import_module("services.document_check").analyze_document
calculate_risk = import_module("services.risk_score").calculate_risk
detect_document = import_module("services.cnn_detector").detect_document

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
PDF_IMAGE_FOLDER = os.path.join(UPLOAD_FOLDER, "pdf_pages")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PDF_IMAGE_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}


def allowed_file(filename):
    extension = os.path.splitext(filename)[1].lower()
    return extension in ALLOWED_EXTENSIONS


def convert_pdf_to_image(pdf_path):
    """
    Convert the first page of a PDF into a PNG image.
    This image is then passed to OCR, document checks and CNN.
    """
    try:
        fitz = import_module("fitz")

        pdf = fitz.open(pdf_path)

        if pdf.page_count == 0:
            pdf.close()
            return None

        page = pdf.load_page(0)

        # Render page at good resolution
        matrix = fitz.Matrix(2, 2)
        pixmap = page.get_pixmap(matrix=matrix, alpha=False)

        image_name = f"{uuid.uuid4().hex}.png"
        image_path = os.path.join(PDF_IMAGE_FOLDER, image_name)

        pixmap.save(image_path)

        pdf.close()

        return image_path

    except Exception as e:
        print("PDF conversion error:", e)
        return None


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    if "document" not in request.files:
        return jsonify({
            "success": False,
            "error": "No document uploaded."
        }), 400

    file = request.files["document"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "error": "Please select a document."
        }), 400

    original_filename = file.filename

    if not allowed_file(original_filename):
        return jsonify({
            "success": False,
            "error": "Unsupported file type. Please upload JPG, JPEG, PNG or PDF."
        }), 400

    # Generate safe unique filename
    extension = os.path.splitext(original_filename)[1].lower()
    safe_filename = f"{uuid.uuid4().hex}{extension}"

    original_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        safe_filename
    )

    file.save(original_path)

    # File used for AI analysis
    analysis_path = original_path

    # Convert PDF first page to PNG
    if extension == ".pdf":

        analysis_path = convert_pdf_to_image(original_path)

        if analysis_path is None:
            return jsonify({
                "success": False,
                "error": "Could not read or convert the PDF."
            }), 400

    # OCR
    extracted_text = extract_text(analysis_path)

    # Basic document analysis
    analysis = analyze_document(
        analysis_path,
        extracted_text
    )

    # CNN analysis
    cnn_result = detect_document(analysis_path)

    analysis["cnn_prediction"] = cnn_result["prediction"]
    analysis["cnn_fake_probability"] = cnn_result["fake_probability"]
    analysis["cnn_authentic_probability"] = cnn_result["authentic_probability"]
    analysis["cnn_confidence"] = cnn_result["confidence"]

    # IMPORTANT:
    # CNN prediction is only a supporting signal.
    # It does NOT directly mark the document as tampered.
    # This prevents the weak prototype CNN from adding a huge risk score.

    # Risk calculation
    risk = calculate_risk(analysis)

    return jsonify({
        "success": True,
        "filename": original_filename,
        "file_type": extension.replace(".", "").upper(),
        "extracted_text": extracted_text,
        "analysis": analysis,
        "cnn": cnn_result,
        "risk": risk
    })


if __name__ == "__main__":
    app.run(debug=True)