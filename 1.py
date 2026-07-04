# create_folder.py

import cloudinary
import cloudinary.api

cloudinary.config(
    cloud_name="dfw273iza",
    api_key="384641448277825",
    api_secret="X9tPK4lIVvU6kusdhRMxDxX4Fhw"
)

try:
    result = cloudinary.api.create_folder("test01")
    print("Folder created successfully")
    print(result)
except Exception as e:
    print("Error:", e)