import importlib
import os

try:
    torch = importlib.import_module("torch")
    nn = importlib.import_module("torch.nn")
    optim = importlib.import_module("torch.optim")
    datasets = importlib.import_module("torchvision.datasets")
    transforms = importlib.import_module("torchvision.transforms")
    models = importlib.import_module("torchvision.models")
    DataLoader = importlib.import_module("torch.utils.data").DataLoader
except ImportError as exc:
    raise SystemExit(
        "PyTorch is not installed in the active Python environment. "
        "Install it with: python -m pip install torch torchvision"
    ) from exc

device = torch.device("cpu")

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])

train_data = datasets.ImageFolder("dataset/train", transform=transform)
val_data = datasets.ImageFolder("dataset/val", transform=transform)

train_loader = DataLoader(
    train_data,
    batch_size=32,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_data,
    batch_size=32,
    shuffle=False,
    num_workers=0
)

print("Classes:", train_data.class_to_idx)
print("Train:", len(train_data))
print("Validation:", len(val_data))

print("Loading ResNet18...")

model = models.resnet18(
    weights=models.ResNet18_Weights.DEFAULT
)

# Freeze pretrained layers
for param in model.parameters():
    param.requires_grad = False

# Train only final classifier
model.fc = nn.Linear(model.fc.in_features, 2)

model = model.to(device)

criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.fc.parameters(), lr=0.001)

print("Starting fast training...")

for epoch in range(3):

    model.train()
    correct = 0
    total = 0

    for images, labels in train_loader:

        images = images.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()

        outputs = model(images)
        loss = criterion(outputs, labels)

        loss.backward()
        optimizer.step()

        _, predicted = torch.max(outputs, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

    train_acc = 100 * correct / total

    model.eval()
    correct = 0
    total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            outputs = model(images)
            _, predicted = torch.max(outputs, 1)

            total += labels.size(0)
            correct += (predicted == labels).sum().item()

    val_acc = 100 * correct / total

    print(
        f"Epoch {epoch+1}/3 | "
        f"Train Accuracy: {train_acc:.2f}% | "
        f"Val Accuracy: {val_acc:.2f}%"
    )

os.makedirs("models", exist_ok=True)

torch.save(model.state_dict(), "models/document_cnn.pth")

print("\nMODEL SAVED!")
print("models/document_cnn.pth")