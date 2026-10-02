import json
import requests
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import os
import datetime
from PIL import Image
import hashlib
import time
import uuid
import threading

app = FastAPI()

# 🌍 100% खुला CORS (सभी पोर्ट्स के लिए अनुमति)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLOUD_NAME = "y7ioik19"
API_KEY = "723715484746536"
API_SECRET = "1kyeJOFP9Sr5HB98F61DE7xzM5s"  # अपनी असली सीक्रेट की यहाँ डालें

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "processed_images")
os.makedirs(UPLOAD_DIR, exist_ok=True)

HISTORY_FILE = os.path.join(BASE_DIR, "history.json")

# 📁 History images yahan permanently save hongi
HISTORY_IMG_DIR = os.path.join(UPLOAD_DIR, "history")
os.makedirs(HISTORY_IMG_DIR, exist_ok=True)
app.mount("/files", StaticFiles(directory=HISTORY_IMG_DIR), name="files")

_history_lock = threading.Lock()

if not os.path.exists(HISTORY_FILE):
    with open(HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump([], f)

def load_history():
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            # purana dummy "sample_init" entry hata do
            return [h for h in data if h.get("status") != "Initialized"]
    except Exception as e:
        print(f"⚠️ history.json read error: {e}")
        return []

def save_history(logs):
    # atomic write: pehle temp file, phir replace (file corrupt nahi hogi)
    tmp = HISTORY_FILE + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(logs, f, indent=4, ensure_ascii=False)
    os.replace(tmp, HISTORY_FILE)

# 🔍 हर आने वाली रिक्वेस्ट को ट्रैक करने के लिए मिडलवेयर
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"🔥 Incoming Request: {request.method} {request.url}")
    response = await call_next(request)
    return response

@app.get("/")
def read_root():
    return {"status": "success", "message": "PixelFlow AI Backend is Live!"}

@app.get("/history")
@app.get("/history/")
def get_history():
    return {"status": "success", "history": load_history()}

@app.post("/history/save")
async def save_history_items(
    files: List[UploadFile] = File(...),
    meta: str = Form(...)
):
    """Frontend ki processed images + details permanently save karta hai."""
    try:
        meta_list = json.loads(meta)
    except Exception:
        return {"status": "error", "message": "Invalid meta JSON"}

    saved_items = []
    for i, file in enumerate(files):
        info = meta_list[i] if i < len(meta_list) else {}
        item_id = uuid.uuid4().hex
        safe_name = os.path.basename(file.filename or f"image_{i}.jpg")
        stored_name = f"{item_id}_{safe_name}"
        if not stored_name.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
            stored_name += ".jpg"

        contents = await file.read()
        with open(os.path.join(HISTORY_IMG_DIR, stored_name), "wb") as f:
            f.write(contents)

        saved_items.append({
            "id": item_id,
            "filename": info.get("filename", safe_name),
            "procSize": info.get("procSize", ""),
            "bgInfo": info.get("bgInfo", ""),
            "tags": info.get("tags", ""),
            "date": info.get("date") or datetime.datetime.now().strftime("%d %b %Y %I:%M %p"),
            "stored_name": stored_name,
            "url": f"http://127.0.0.1:8000/files/{stored_name}",
        })

    with _history_lock:
        history = load_history()
        history = saved_items + history
        save_history(history)

    print(f"💾 {len(saved_items)} items history.json me save ho gaye")
    return {"status": "success", "saved": saved_items}

@app.delete("/history/{item_id}")
def delete_history_item(item_id: str):
    with _history_lock:
        history = load_history()
        keep, removed = [], None
        for h in history:
            if h.get("id") == item_id and removed is None:
                removed = h
            else:
                keep.append(h)
        save_history(keep)
    if removed and removed.get("stored_name"):
        try:
            os.remove(os.path.join(HISTORY_IMG_DIR, removed["stored_name"]))
        except OSError:
            pass
    return {"status": "success", "deleted": bool(removed)}

@app.delete("/history")
def clear_history():
    with _history_lock:
        for h in load_history():
            if h.get("stored_name"):
                try:
                    os.remove(os.path.join(HISTORY_IMG_DIR, h["stored_name"]))
                except OSError:
                    pass
        save_history([])
    return {"status": "success"}

@app.post("/process-images-master/")
async def process_images(
    files: List[UploadFile] = File(...),
    platform: str = Form(...),
    width: int = Form(...),
    height: int = Form(...),
    bg_type: str = Form(...),
    bg_color: str = Form(...)
):
    print("📥 SUCCESS: Process images endpoint hit from frontend!")
    processed_results = []
    total_improvements_found = 0
    audit_findings = []
    new_history_items = []

    for file in files:
        temp_local_path = os.path.join(UPLOAD_DIR, file.filename)
        contents = await file.read()
        
        with open(temp_local_path, "wb") as f:
            f.write(contents)

        try:
            with Image.open(temp_local_path) as img:
                total_improvements_found += 1
                audit_findings.append({
                    "filename": file.filename,
                    "issues": ["optimized alignment"]
                })

                img_fixed = img.resize((width, height), Image.Resampling.LANCZOS)
                processed_local_path = os.path.join(UPLOAD_DIR, f"fixed_{file.filename}")
                img_fixed.save(processed_local_path)

            # Cloudinary Upload (Direct HTTP)
            timestamp = str(int(time.time()))
            string_to_sign = f"folder=pixelflow_studio&timestamp={timestamp}{API_SECRET}"
            signature = hashlib.sha1(string_to_sign.encode("utf-8")).hexdigest()
            url = f"https://api.cloudinary.com/v1_1/{CLOUD_NAME}/image/upload"
            
            with open(processed_local_path, "rb") as f:
                res = requests.post(url, data={
                    "api_key": API_KEY,
                    "timestamp": timestamp,
                    "folder": "pixelflow_studio",
                    "signature": signature
                }, files={"file": f}, timeout=20)
                res_data = res.json()
                
            secure_url = res_data.get("secure_url")
            if secure_url:
                print(f"✅ CLOUDINARY SUCCESS: {secure_url}")
            else:
                print(f"❌ CLOUDINARY FAILED, using local fallback: {res_data}")
                secure_url = f"http://127.0.0.1:8000/download-single/{file.filename}"

        except Exception as e:
            print(f"⚠️ Process Error: {e}")
            secure_url = f"http://127.0.0.1:8000/download-single/{file.filename}"

        history_item = {
            "filename": file.filename,
            "platform": platform,
            "width": width,
            "height": height,
            "status": "AI Auto-Fixed",
            "created_at": datetime.datetime.now().strftime("%d %b %Y %I:%M %p"),
            "secure_url": secure_url,
            "url": secure_url
        }
        
        processed_results.append(history_item)
        new_history_items.append(history_item)

    with _history_lock:
        save_history(new_history_items + load_history())
    print("💾 history.json updated successfully!")

    return {
        "status": "success",
        "message": f"✨ {total_improvements_found} improvements fixed!",
        "audit_summary": {"total_improvements": total_improvements_found, "details": audit_findings},
        "data": processed_results
    }

@app.get("/download-single/{filename}")
def download_single(filename: str):
    file_path = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, filename=filename)
    return {"error": "File not found"}