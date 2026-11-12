import torch
from PIL import Image
from torchvision import transforms, models
from torch import nn

print("Loading trained ResNet18...")

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)

model.load_state_dict(
    torch.load("models/document_cnn.pth", map_location="cpu")
)

model.eval()

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

for filename in ["fake.jpg", "real.jpg"]:

    print("\nTesting:", filename)

    image = Image.open(
        "test_images/" + filename
    ).convert("RGB")

    image = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(image)
        probability = torch.softmax(output, dim=1)

    fake = probability[0][0].item() * 100
    real = probability[0][1].item() * 100

    prediction = "FAKE" if fake > real else "REAL"

    print("-------------------------")
    print("Prediction:", prediction)
    print(f"Fake Probability: {fake:.2f}%")
    print(f"Real Probability: {real:.2f}%")
    print("-------------------------")

print("\nTesting completed!")