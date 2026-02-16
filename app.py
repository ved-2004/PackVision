from fastapi import FastAPI, File, UploadFile, Form
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from typing import List, Optional

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
async def read_root():
    """Serve the main HTML page"""
    return FileResponse("index.html")


@app.post("/api/generate-checklist")
async def generate_checklist(
    files: List[UploadFile] = File(...),
    destination: str = Form(...),
    start_date: str = Form(...),
    end_date: str = Form(...),
    notes: Optional[str] = Form(None)
):
    """
    Generate a travel checklist based on uploaded images/videos and travel details
    
    Expected response format:
    {
        "destination": "Tokyo, Japan",
        "start_date": "2024-03-15",
        "end_date": "2024-03-22",
        "checklist": {
            "Documents": [
                "Passport",
                "Flight tickets",
                "Hotel reservations"
            ],
            "Clothing": [
                "T-shirts (5)",
                "Jeans (2)",
                "Jacket"
            ],
            "Electronics": [
                "Camera",
                "Phone charger",
                "Power adapter"
            ],
            "Toiletries": [
                "Toothbrush",
                "Shampoo",
                "Sunscreen"
            ]
        }
    }
    """

    sample_response = {
        "destination": destination,
        "start_date": start_date,
        "end_date": end_date,
        "checklist": {
            "Documents": [
                "Passport",
                "Travel visa (if required)",
                "Flight tickets",
                "Hotel confirmation",
                "Travel insurance",
                "Driver's license"
            ],
            "Clothing": [
                "Underwear (7 pairs)",
                "Socks (7 pairs)",
                "T-shirts (5)",
                "Pants/Jeans (3)",
                "Sweater/Jacket",
                "Pajamas",
                "Comfortable walking shoes",
                "Sandals/flip-flops"
            ],
            "Electronics": [
                "Smartphone",
                "Phone charger",
                "Power bank",
                "Camera",
                "Laptop/Tablet",
                "Headphones",
                "Universal power adapter"
            ],
            "Toiletries": [
                "Toothbrush & toothpaste",
                "Shampoo & conditioner",
                "Body wash",
                "Deodorant",
                "Sunscreen",
                "Medications",
                "First aid kit",
                "Hand sanitizer"
            ],
            "Miscellaneous": [
                "Backpack/Daypack",
                "Water bottle",
                "Sunglasses",
                "Hat/Cap",
                "Umbrella",
                "Travel pillow",
                "Books/E-reader",
                "Snacks"
            ]
        }
    }
    
    return sample_response


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)