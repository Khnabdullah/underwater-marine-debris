# NirmalSagar – Underwater Marine Litter & Plastic Detection

**Domain:** Marine (Environment & Climate) × Underwater Object Detection / Segmentation

---

## 1. Description

Detects and segments plastic and debris in underwater imagery to support cleanup prioritisation and pollution monitoring along India's coasts and seafloor - with attention to the hard part: **domain shift** (models trained on one site failing on murky, differently-lit Indian waters).

---

## 2. Why It's Advanced & Unique

Object detection and instance segmentation in turbid, low-light, cluttered underwater scenes, plus domain-generalisation techniques so the model works across sites - a genuine research challenge, not a clean-image demo.

---

## 3. Input & Output

### Input

- Underwater photo
- Underwater video frame

### Output

- Bounding boxes / segmentation masks around each piece of trash
- Trash classification (plastic, net, metal)
- Debris-density estimate for the area

---

## 4. Technical Stack

- Deep Learning
- Computer Vision
- YOLO
- Faster R-CNN
- Mask R-CNN
- Underwater Image Enhancement
- Domain Adaptation
- Data Augmentation

---

## 5. Datasets

### TrashCan 1.0

<https://conservancy.umn.edu/items/6dd6a960-c44a-4510-a679-efb8c82ebfb7>

---

### SeaClear Marine Debris Dataset

<https://data.4tu.nl/datasets/4f1dff25-e157-4399-a5d4-478055461689>

---

### JAMSTEC Deep-sea Debris Database + Underwater Plastic Pollution Detection

<https://www.godac.jamstec.go.jp/dsdebris/e/dataset/j-litter.html>
