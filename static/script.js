// ======================================================
// VERIDOC AI - FRONTEND CONTROLLER
// ======================================================


// ================= ELEMENTS =================

const fileInput =
    document.getElementById("document");

const dropZone =
    document.getElementById("dropZone");

const viewer =
    document.getElementById("viewer");

const documentPreview =
    document.getElementById("documentPreview");

const pdfPreview =
    document.getElementById("pdfPreview");

const previewName =
    document.getElementById("previewName");

const previewSize =
    document.getElementById("previewSize");

const removeFile =
    document.getElementById("removeFile");

const analyzeButton =
    document.getElementById("analyzeButton");

const scanning =
    document.getElementById("scanning");

const scanOverlay =
    document.getElementById("scanOverlay");


// ================= STATE =================

let selectedFile = null;

let zoomLevel = 1;

let rotation = 0;

let currentPreviewURL = null;


// ================= SESSION =================

function generateSessionID() {

    const random =
        Math.floor(10000 + Math.random() * 90000);

    document.getElementById("sessionId")
        .textContent = "VD-" + random;
}

generateSessionID();


// ================= FILE SELECTION =================

fileInput.addEventListener(
    "change",
    function () {

        if (this.files.length > 0) {

            handleFile(this.files[0]);

        }

    }
);
// ================= UPLOAD BUTTON CLICK =================

dropZone.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


// ================= DRAG & DROP =================

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add("dragover");

    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove("dragover");

    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove("dragover");

        const file =
            event.dataTransfer.files[0];

        if (!file) return;

        handleFile(file);

    }
);


// ================= HANDLE FILE =================

function handleFile(file) {

    const fileName =
        file.name.toLowerCase();

    const isImage =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/jpg" ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png");

    const isPDF =
        file.type === "application/pdf" ||
        fileName.endsWith(".pdf");


    if (!isImage && !isPDF) {

        showToast(
            "Please upload JPG, JPEG, PNG or PDF."
        );

        return;
    }


    selectedFile = file;

    showPreview(file);

}


// ================= PREVIEW =================

function showPreview(file) {

    previewName.textContent =
        file.name;

    previewSize.textContent =
        formatFileSize(file.size);


    dropZone.style.display =
        "none";

    viewer.style.display =
        "block";


    resetImage();


    const fileName =
        file.name.toLowerCase();


    const isPDF =
        file.type === "application/pdf" ||
        fileName.endsWith(".pdf");


    // ================= PDF =================

    if (isPDF) {

        documentPreview.style.display =
            "none";

        pdfPreview.style.display =
            "block";


        if (currentPreviewURL) {

            URL.revokeObjectURL(
                currentPreviewURL
            );

        }


        currentPreviewURL =
            URL.createObjectURL(file);


        pdfPreview.src =
            currentPreviewURL;


        showToast(
            "PDF loaded successfully."
        );


        return;
    }


    // ================= IMAGE =================

    pdfPreview.style.display =
        "none";

    pdfPreview.src = "";


    documentPreview.style.display =
        "block";


    const reader =
        new FileReader();


    reader.onload =
        function (event) {

            documentPreview.src =
                event.target.result;

            resetImage();

        };


    reader.readAsDataURL(file);

}


// ================= FILE SIZE =================

function formatFileSize(bytes) {

    if (bytes < 1024) {

        return bytes + " B";

    }

    if (bytes < 1024 * 1024) {

        return (
            bytes / 1024
        ).toFixed(1) + " KB";

    }

    return (
        bytes / (1024 * 1024)
    ).toFixed(1) + " MB";

}


// ================= REMOVE FILE =================

removeFile.addEventListener(
    "click",
    function () {

        selectedFile = null;

        fileInput.value = "";


        if (currentPreviewURL) {

            URL.revokeObjectURL(
                currentPreviewURL
            );

            currentPreviewURL = null;

        }


        documentPreview.src = "";

        pdfPreview.src = "";


        documentPreview.style.display =
            "block";

        pdfPreview.style.display =
            "none";


        viewer.style.display =
            "none";

        dropZone.style.display =
            "grid";


        analyzeButton.style.display =
            "flex";

        scanning.style.display =
            "none";

        scanOverlay.style.display =
            "none";


        resetImage();

        resetResults();

    }
);


// ================= IMAGE CONTROLS =================

document.getElementById("zoomIn")
    .addEventListener(
        "click",
        function () {

            // Zoom controls are mainly for images
            if (!isCurrentFileImage()) {

                showToast(
                    "Zoom controls are for image previews."
                );

                return;
            }


            zoomLevel += 0.1;

            updateImage();

        }
    );


document.getElementById("zoomOut")
    .addEventListener(
        "click",
        function () {

            if (!isCurrentFileImage()) {

                showToast(
                    "Zoom controls are for image previews."
                );

                return;
            }


            zoomLevel =
                Math.max(
                    0.5,
                    zoomLevel - 0.1
                );

            updateImage();

        }
    );


document.getElementById("zoomReset")
    .addEventListener(
        "click",
        function () {

            if (!isCurrentFileImage()) {

                return;
            }

            resetImage();

        }
    );


document.getElementById("rotateBtn")
    .addEventListener(
        "click",
        function () {

            if (!isCurrentFileImage()) {

                showToast(
                    "Rotate is available for image previews."
                );

                return;
            }


            rotation += 90;

            updateImage();

        }
    );


function isCurrentFileImage() {

    if (!selectedFile) {

        return false;

    }


    const name =
        selectedFile.name.toLowerCase();


    return (
        selectedFile.type.startsWith("image/") ||
        name.endsWith(".jpg") ||
        name.endsWith(".jpeg") ||
        name.endsWith(".png")
    );

}


function updateImage() {

    documentPreview.style.transform =
        `scale(${zoomLevel}) rotate(${rotation}deg)`;


    document.getElementById("zoomReset")
        .textContent =
        Math.round(zoomLevel * 100) + "%";

}


function resetImage() {

    zoomLevel = 1;

    rotation = 0;

    updateImage();

}


// ======================================================
// ANALYZE DOCUMENT
// ======================================================

async function analyzeDocument() {

    if (!selectedFile) {

        showToast(
            "Please upload a document first."
        );

        return;

    }


    // ================= UI =================

    analyzeButton.style.display =
        "none";

    scanning.style.display =
        "block";

    scanOverlay.style.display =
        "block";


    // Activate pipeline

    activateStep("uploadStep");

    activateStep("ocrStep");


    const formData =
        new FormData();


    formData.append(
        "document",
        selectedFile
    );


    try {

        const response =
            await fetch(
                "/analyze",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok || data.error) {

            throw new Error(
                data.error ||
                "Server error"
            );

        }


        // ================= BASIC DATA =================

        const score =
            Number(
                data.risk?.score || 0
            );


        const level =
            data.risk?.level || "LOW";


        const analysis =
            data.analysis || {};


        const cnn =
            data.cnn || {};


        // ================= DISPLAY =================

        document.getElementById("score")
            .textContent =
            score + "%";


        document.getElementById("ocrSignal")
            .textContent =
            analysis.text_found
                ? "Text detected"
                : "No text";


        document.getElementById("imageSignal")
            .textContent =
            analysis.image_quality ||
            "Unknown";


        document.getElementById("text")
            .textContent =
            data.extracted_text ||
            "No text detected.";


        // ================= RISK =================

        updateRisk(
            score,
            level
        );


        // ================= METRICS =================

        updateMetrics(
            score,
            analysis,
            cnn
        );


        // ================= PIPELINE =================

        completeStep("uploadStep");

        completeStep("ocrStep");

        activateStep("visualStep");


        setTimeout(
            function () {

                completeStep("visualStep");

                activateStep("riskStep");


                setTimeout(
                    function () {

                        completeStep(
                            "riskStep"
                        );

                    },
                    300
                );

            },
            350
        );


        // ================= EXPLANATION =================

        createExplanation(
            score,
            level,
            analysis,
            cnn
        );


        // ================= HISTORY =================

        saveHistory(
            selectedFile.name,
            score,
            level
        );


        showToast(
            "Document analysis completed."
        );


    } catch (error) {

        console.error(error);

        showToast(
            "Analysis failed: " +
            error.message
        );

    } finally {

        setTimeout(
            function () {

                scanning.style.display =
                    "none";

                analyzeButton.style.display =
                    "flex";

                scanOverlay.style.display =
                    "none";

            },
            600
        );

    }

}


// ======================================================
// RISK
// ======================================================

function updateRisk(score, level) {

    const circle =
        document.getElementById(
            "riskCircle"
        );


    const badge =
        document.getElementById(
            "riskBadge"
        );


    const message =
        document.getElementById(
            "riskMessage"
        );


    const degrees =
        Math.min(
            Math.max(score, 0),
            100
        ) * 3.6;


    circle.style.setProperty(
        "--risk",
        degrees + "deg"
    );


    badge.textContent =
        level.toUpperCase();


    if (level === "LOW") {

        badge.style.color =
            "#22c55e";

        badge.style.background =
            "rgba(34,197,94,0.09)";

        message.textContent =
            "Low-risk signals detected. Document appears relatively consistent.";

    }

    else if (level === "MEDIUM") {

        badge.style.color =
            "#f59e0b";

        badge.style.background =
            "rgba(245,158,11,0.09)";

        message.textContent =
            "Some verification signals require additional attention.";

    }

    else {

        badge.style.color =
            "#ef4444";

        badge.style.background =
            "rgba(239,68,68,0.09)";

        message.textContent =
            "High-risk signals detected. Further verification is recommended.";

    }

}


// ======================================================
// METRICS
// ======================================================

function updateMetrics(
    score,
    analysis,
    cnn
) {

    let integrity =
        Math.max(
            0,
            100 - score
        );


    let ocr =
        analysis.text_found
            ? 96
            : 20;


    let visual =
        analysis.possible_tampering
            ? 25
            : 88;


    // Use actual CNN confidence if available

    if (
        cnn &&
        typeof cnn.authentic_probability === "number"
    ) {

        visual =
            Math.round(
                cnn.authentic_probability
            );

    }


    document.getElementById(
        "integrityValue"
    ).textContent =
        integrity + "%";


    document.getElementById(
        "ocrConfidence"
    ).textContent =
        ocr + "%";


    document.getElementById(
        "visualConfidence"
    ).textContent =
        visual + "%";


    // ================= SIGNALS =================

    const ocrBadge =
        document.getElementById(
            "ocrSignalBadge"
        );


    const imageBadge =
        document.getElementById(
            "imageSignalBadge"
        );


    const visualBadge =
        document.getElementById(
            "visualSignalBadge"
        );


    // OCR

    if (analysis.text_found) {

        ocrBadge.textContent =
            "✓";

        ocrBadge.style.color =
            "#22c55e";

    }

    else {

        ocrBadge.textContent =
            "⚠";

        ocrBadge.style.color =
            "#f59e0b";

    }


    // Image quality

    if (
        analysis.image_quality === "Good"
    ) {

        imageBadge.textContent =
            "✓";

        imageBadge.style.color =
            "#22c55e";

    }

    else {

        imageBadge.textContent =
            "⚠";

        imageBadge.style.color =
            "#f59e0b";

    }


    // ================= CNN =================

    if (
        cnn &&
        cnn.status === "success"
    ) {

        if (
            cnn.prediction ===
            "Potentially Fake"
        ) {

            visualBadge.textContent =
                "⚠";

            visualBadge.style.color =
                "#f59e0b";


            document.getElementById(
                "visualSignal"
            ).textContent =
                "Potential fake signal";

        }

        else {

            visualBadge.textContent =
                "AI";

            visualBadge.style.color =
                "#38bdf8";


            document.getElementById(
                "visualSignal"
            ).textContent =
                "Likely authentic";

        }

    }

    else {

        visualBadge.textContent =
            "—";

        visualBadge.style.color =
            "#94a3b8";

    }

}


// ======================================================
// PIPELINE
// ======================================================

function activateStep(id) {

    const element =
        document.getElementById(id);


    if (element) {

        element.classList.add(
            "active"
        );

    }

}


function completeStep(id) {

    const element =
        document.getElementById(id);


    if (!element) return;


    element.classList.add(
        "completed"
    );


    element.classList.remove(
        "active"
    );


    const icon =
        element.querySelector(
            ".step-icon"
        );


    if (icon) {

        icon.textContent =
            "✓";

    }

}


// ======================================================
// AI EXPLANATION
// ======================================================

function createExplanation(
    score,
    level,
    analysis,
    cnn
) {

    const container =
        document.getElementById(
            "explanation"
        );


    container.innerHTML = "";


    addExplanation(
        container,
        analysis.image_quality === "Good",
        analysis.image_quality === "Good"
            ? "Image quality is sufficient for analysis."
            : "Image quality is low and may affect verification."
    );


    addExplanation(
        container,
        analysis.text_found,
        analysis.text_found
            ? "OCR successfully detected document text."
            : "OCR could not confidently detect enough text."
    );


    addExplanation(
        container,
        !analysis.possible_tampering,
        analysis.possible_tampering
            ? "Potential visual manipulation requires review."
            : "No visual tampering flag is currently active."
    );


    // CNN explanation

    if (
        cnn &&
        cnn.status === "success"
    ) {

        if (
            cnn.prediction ===
            "Potentially Fake"
        ) {

            addExplanation(
                container,
                false,
                "CNN detected a potentially suspicious visual pattern."
            );

        }

        else {

            addExplanation(
                container,
                true,
                "CNN did not detect a strong visual-fraud signal."
            );

        }

    }


    addExplanation(
        container,
        level === "LOW",
        "Risk engine generated a " +
        level.toLowerCase() +
        "-risk preliminary assessment."
    );

}


function addExplanation(
    container,
    passed,
    message
) {

    const item =
        document.createElement(
            "div"
        );


    item.className =
        "explanation-item";


    const icon =
        passed ? "✓" : "⚠";


    item.innerHTML = `
        <span>${icon}</span>
        <p>${escapeHTML(message)}</p>
    `;


    container.appendChild(item);

}


// ======================================================
// RESET RESULTS
// ======================================================

function resetResults() {

    document.getElementById(
        "score"
    ).textContent = "--";


    document.getElementById(
        "riskBadge"
    ).textContent =
        "WAITING FOR DOCUMENT";


    document.getElementById(
        "riskMessage"
    ).textContent =
        "Upload a document to start verification.";


    document.getElementById(
        "integrityValue"
    ).textContent = "--";


    document.getElementById(
        "ocrConfidence"
    ).textContent = "--";


    document.getElementById(
        "visualConfidence"
    ).textContent = "--";


    document.getElementById(
        "ocrSignal"
    ).textContent =
        "Pending";


    document.getElementById(
        "imageSignal"
    ).textContent =
        "Pending";


    document.getElementById(
        "visualSignal"
    ).textContent =
        "CNN pending";


    document.getElementById(
        "ocrSignalBadge"
    ).textContent = "—";


    document.getElementById(
        "imageSignalBadge"
    ).textContent = "—";


    document.getElementById(
        "visualSignalBadge"
    ).textContent = "—";


    document.getElementById(
        "text"
    ).textContent =
        "No document analyzed yet.";


    document.getElementById(
        "explanation"
    ).innerHTML = `
        <div class="explanation-item">
            <span>○</span>
            <p>
                Upload a document to generate
                verification insights.
            </p>
        </div>
    `;


    // Reset pipeline

    [
        "uploadStep",
        "ocrStep",
        "visualStep",
        "riskStep"
    ].forEach(
        function (id) {

            const step =
                document.getElementById(id);

            if (!step) return;

            step.classList.remove(
                "active",
                "completed"
            );

        }
    );


    // Reset icons

    const icons =
        document.querySelectorAll(
            ".pipeline-step .step-icon"
        );


    icons.forEach(
        function (icon, index) {

            icon.textContent =
                String(index + 1)
                    .padStart(2, "0");

        }
    );

}


// ======================================================
// HISTORY
// ======================================================

function saveHistory(
    filename,
    score,
    level
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "veridocHistory"
            ) || "[]"
        );


    const item = {

        filename: filename,

        score: score,

        level: level,

        time:
            new Date()
            .toLocaleTimeString(
                [],
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            )

    };


    history.unshift(item);


    const limited =
        history.slice(0, 6);


    localStorage.setItem(
        "veridocHistory",
        JSON.stringify(limited)
    );


    renderHistory();

}


// ================= RENDER HISTORY =================

function renderHistory() {

    const container =
        document.getElementById(
            "history"
        );


    const history =
        JSON.parse(
            localStorage.getItem(
                "veridocHistory"
            ) || "[]"
        );


    if (history.length === 0) {

        container.innerHTML = `
            <div class="empty-history">
                No previous verification sessions.
            </div>
        `;

        return;

    }


    container.innerHTML =
        history.map(
            item => `

                <div class="history-row">

                    <strong>
                        ${escapeHTML(
                            item.filename
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.time
                        )}
                    </span>

                    <strong>
                        ${escapeHTML(
                            item.score
                        )}%
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.level
                        )}
                    </span>

                </div>

            `
        ).join("");

}


renderHistory();


// ======================================================
// CLEAR HISTORY
// ======================================================

document.getElementById(
    "clearHistory"
).addEventListener(
    "click",
    function () {

        localStorage.removeItem(
            "veridocHistory"
        );

        renderHistory();

        showToast(
            "History cleared."
        );

    }
);


// ======================================================
// COPY OCR
// ======================================================

document.getElementById(
    "copyText"
).addEventListener(
    "click",
    async function () {

        const text =
            document.getElementById(
                "text"
            ).textContent;


        try {

            await navigator.clipboard
                .writeText(text);


            showToast(
                "OCR text copied."
            );

        }

        catch {

            showToast(
                "Unable to copy text."
            );

        }

    }
);

analyzeButton.addEventListener(
    "click",
    analyzeDocument
);

// ======================================================
// TOAST
// ======================================================

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    toast.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        function () {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ======================================================
// SECURITY
// ======================================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /[&<>"']/g,
            function (character) {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };


                return entities[
                    character
                ];

            }
        );

}