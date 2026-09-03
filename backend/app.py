import io
import cv2
import numpy as np
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import pathlib

app = FastAPI(title="NirmalSagar Backend API")

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the model globally so it's ready when requests come in
model_path = (
    pathlib.Path(__file__).parent
    / "runs"
    / "yolo11s_trashcan_core3"
    / "weights"
    / "best.pt"
)

# Only attempt to load if it exists to avoid crash on startup
try:
    if model_path.exists():
        model = YOLO(str(model_path))
        print(f"Successfully loaded YOLO model from {model_path}")
        print(f"Model task: {model.task} | Classes: {model.names}")
    else:
        print(f"Warning: Model not found at {model_path}")
        model = None
except Exception as e:
    print(f"Failed to load model: {e}")
    model = None


@app.get("/")
def read_root():
    return {"status": "ok", "message": "NirmalSagar API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """
    Accepts an image, runs YOLO segmentation inference, and returns a JSON response
    containing:
      - annotated_image: base64-encoded JPEG with bounding boxes & masks
      - num_detections: total number of objects detected
      - detections: list of {class, confidence, bbox} per object
    """
    if model is None:
        return JSONResponse(
            status_code=503,
            content={
                "error": "Model is not loaded. Ensure best.pt is in the correct directory."
            },
        )

    try:
        # Read and decode uploaded image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Invalid image format. Please upload a valid JPG/PNG."
                },
            )

        orig_h, orig_w = img.shape[:2]

        # Run inference.
        # conf=0.05 is deliberately low to surface detections even in domain-shifted
        # underwater imagery. retina_masks=True gives higher-quality segmentation masks.
        results = model(
            img,
            conf=0.05,
            iou=0.45,
            imgsz=640,
            retina_masks=True,
        )

        result = results[0]
        num_detections = len(result.boxes)

        # Build per-detection metadata list
        detections = []
        if num_detections > 0:
            for i, box in enumerate(result.boxes):
                cls_id = int(box.cls.item())
                conf = float(box.conf.item())
                xyxy = box.xyxy[0].cpu().numpy().tolist()
                detections.append(
                    {
                        "id": i + 1,
                        "class": model.names[cls_id],
                        "label": model.names[cls_id].title().replace("_", " "),
                        "confidence": round(conf * 100, 1),  # as percentage
                        "bbox": [round(v, 1) for v in xyxy],
                    }
                )

        # Draw annotations. result.plot() returns a BGR numpy array at the model's
        # internal (letterboxed) resolution. Resize back to the original dimensions
        # so the returned image matches what the user uploaded.
        annotated_internal = result.plot(
            line_width=2,
            font_size=0.6,
            labels=True,
            conf=True,
            boxes=True,
            masks=True,
        )
        annotated_img = cv2.resize(
            annotated_internal,
            (orig_w, orig_h),
            interpolation=cv2.INTER_LINEAR,
        )

        # Encode annotated image to JPEG and then to base64 for JSON transport
        _, encoded_img = cv2.imencode(
            ".jpg", annotated_img, [cv2.IMWRITE_JPEG_QUALITY, 92]
        )
        img_b64 = base64.b64encode(encoded_img.tobytes()).decode("utf-8")

        return JSONResponse(
            content={
                "success": True,
                "num_detections": num_detections,
                "detections": detections,
                "annotated_image": img_b64,
            }
        )

    except Exception as e:
        import traceback

        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
