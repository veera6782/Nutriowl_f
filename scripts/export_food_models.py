"""Export the NutriVision YOLOv8 food models for in-browser use.

Converts the trained .pt weights to ONNX (written to public/models/) and builds
src/data/foodModels.json: each model's class labels plus per-100 g nutrition for
every label, matched against NutriVision's local nutrition database.

Usage (needs ultralytics, onnx and onnxslim):
    python scripts/export_food_models.py ~/nutrivision-capstone
"""

import csv
import json
import re
import shutil
import sys
import tempfile
from pathlib import Path

from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent.parent
MODELS = ["food_baseline", "indian_food"]
IMG_SIZE = 640
OPSET = 17  # widely supported by onnxruntime-web


def load_nutrition_db(backend):
    """Mirror NutriVision's _load_nutrition_db: Nutrition5k CSV, then manual overrides."""
    db = {}
    with open(backend / "data" / "ingredients_metadata.csv", encoding="utf-8") as f:
        for row in csv.DictReader(f):
            name = row.get("ingr_name", "").strip().lower()
            try:
                cal = float(row.get("cal/g") or 0) * 100
                if name and cal > 0:
                    db[name] = {
                        "calories": round(cal, 1),
                        "fat": round(float(row.get("fat(g)") or 0) * 100, 1),
                        "carbs": round(float(row.get("carb(g)") or 0) * 100, 1),
                        "protein": round(float(row.get("protein(g)") or 0) * 100, 1),
                    }
            except ValueError:
                continue
    sys.path.insert(0, str(backend))
    from nutrition_data import MANUAL_NUTRITION_DB

    db.update(MANUAL_NUTRITION_DB)
    return db


def contains_words(text, words):
    return re.search(rf"\b{re.escape(words)}s?\b", text) is not None


def match_nutrition(label, db):
    """NutriVision's lookup_local_nutrition rules (exact, then longest contained
    entry, then containing entry), but on whole words (allowing a plural "s") so "steamed" can't match "tea"."""
    query = label.strip().lower()
    if query in db:
        return query
    keys = sorted(db, key=len, reverse=True)
    for key in keys:
        if len(key) >= 3 and contains_words(query, key):
            return key
    for key in keys:
        if len(query) >= 3 and contains_words(key, query):
            return key
    return None


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    backend = Path(sys.argv[1]).expanduser().resolve() / "backend"
    db = load_nutrition_db(backend)

    out_dir = ROOT / "public" / "models"
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest = {"inputSize": IMG_SIZE, "servingGrams": 150, "models": [], "nutrition": {}}

    with tempfile.TemporaryDirectory() as tmp:
        for name in MODELS:
            # Export from a copy so nothing is written into the NutriVision repo.
            weights = Path(tmp) / f"{name}.pt"
            shutil.copy(backend / "weights" / f"{name}.pt", weights)
            model = YOLO(str(weights))
            onnx_path = model.export(format="onnx", imgsz=IMG_SIZE, opset=OPSET, simplify=True)
            shutil.copy(onnx_path, out_dir / f"{name}.onnx")

            labels = [model.names[i].replace("_", " ") for i in range(len(model.names))]
            manifest["models"].append({
                "file": f"/models/{name}.onnx",
                "labels": labels,
                # NutriVision down-weights unsure guesses from its small specialist model
                # so they don't override the general model.
                "specialist": len(labels) <= 100,
            })
            for label in labels:
                key = match_nutrition(label, db)
                if key:
                    manifest["nutrition"][label] = {**db[key], "matched": key}

    data_path = ROOT / "src" / "data" / "foodModels.json"
    data_path.parent.mkdir(parents=True, exist_ok=True)
    data_path.write_text(json.dumps(manifest, indent=1) + "\n")

    labels = {l for m in manifest["models"] for l in m["labels"]}
    missing = sorted(labels - manifest["nutrition"].keys())
    print(f"Wrote {len(MODELS)} models; nutrition matched for {len(labels) - len(missing)}/{len(labels)} labels")
    if missing:
        print("No nutrition data for:", ", ".join(missing))


if __name__ == "__main__":
    main()
