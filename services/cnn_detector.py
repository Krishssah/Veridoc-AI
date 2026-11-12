import os
import torch  # type: ignore[reportMissingImports]
from torch import nn  # type: ignore[reportMissingImports]
from PIL import Image  # type: ignore[reportMissingImports]
from torchvision import transforms, models  # type: ignore[reportMissingImports]


device = torch.device("cpu")

MODEL_PATH = "models/document_cnn.pth"


# Create ResNet18
model = models.resnet18(weights=None)

# Our model has 2 classes:
# fake = 0
# real = 1
model.fc = nn.Linear(model.fc.in_features, 2)

model = model.to(device)

model_loaded = False


# Load trained model
if os.path.exists(MODEL_PATH):

    try:
        model.load_state_dict(
            torch.load(
                MODEL_PATH,
                map_location=device
            )
        )

        model.eval()
        model_loaded = True

        print("CNN model loaded successfully.")

    except Exception as e:

        print("CNN model loading failed:", e)


# Same preprocessing used during training
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


def detect_document(image_path):

    if not model_loaded:

        return {
            "status": "Model unavailable",
            "prediction": "Unavailable",
            "fake_probability": 0,
            "authentic_probability": 0,
            "confidence": 0
        }

    try:

        image = Image.open(image_path).convert("RGB")

        image = transform(image)
        image = image.unsqueeze(0).to(device)

        with torch.no_grad():

            output = model(image)

            probabilities = torch.softmax(
                output,
                dim=1
            )

        fake_probability = (
            probabilities[0][0].item() * 100
        )

        authentic_probability = (
            probabilities[0][1].item() * 100
        )

        if fake_probability > authentic_probability:

            prediction = "Potentially Fake"
            confidence = fake_probability

        else:

            prediction = "Likely Authentic"
            confidence = authentic_probability

        return {
            "status": "success",
            "prediction": prediction,
            "fake_probability": round(fake_probability, 2),
            "authentic_probability": round(authentic_probability, 2),
            "confidence": round(confidence, 2)
        }

    except Exception as e:

        return {
            "status": "error",
            "prediction": "Analysis Failed",
            "fake_probability": 0,
            "authentic_probability": 0,
            "confidence": 0,
            "error": str(e)
        }