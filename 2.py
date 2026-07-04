# upload_files.py

import cloudinary
import cloudinary.uploader
import pandas as pd
cloudinary.config(
    cloud_name="dfw273iza",
    api_key="384641448277825",
    api_secret="X9tPK4lIVvU6kusdhRMxDxX4Fhw"
)
df = pd.read_csv("df.csv")
df.to_csv("modified.csv")

files = [
    "df.csv",
    "modified.csv"
]

for file_path in files:
    result = cloudinary.uploader.upload(
        file_path,
        folder="test01",
        resource_type="auto"
    )

    print(f"Uploaded: {file_path}")
    print("Public ID:", result["public_id"])
    print("URL:", result["secure_url"])
    print("-" * 50)