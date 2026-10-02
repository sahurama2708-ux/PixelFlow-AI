# 🎨 PixelFlow AI

PixelFlow AI ek modern, full-stack web application hai jo advanced image processing, batch resizing, aur cloud storage (Cloudinary) ko ek sleek aur user-friendly interface ke sath combine karti hai.

---

## 🚀 Features

- **Batch Image Processing:** Ek sath kai images ko upload aur resize karein.
- **Smart Background Management:** Custom colors ya background options ke sath images customize karein.
- **Cloud & Local Storage Fallback:** Cloudinary integration ke sath-sath local storage aur history tracking (`history.json`).
- **Modern Tech Stack:** FastAPI backend aur React frontend ke sath fast performance.

---

## 🛠️ Tech Stack

- **Backend:** Python, FastAPI, Pillow (PIL), Uvicorn, Requests
- **Frontend:** React.js, Vite, Tailwind CSS / Modern CSS
- **Storage & Cloud:** Cloudinary API, Local JSON Persistence

---

## 📂 Project Structure

```text
pixelflowai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── history.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
