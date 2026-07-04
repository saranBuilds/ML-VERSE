"""
cloudinary_utils.py
-------------------
Thin helpers for persisting dataset files to / from Cloudinary.
Only the *original* (unmodified) upload is ever stored here.
Transformed dataframes are always rebuilt at runtime.
"""

import os
import requests
import cloudinary
import cloudinary.uploader

from backend.config import Config


def _init_cloudinary():
    """Configure Cloudinary from app Config (idempotent)."""
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True,
    )


def upload_dataset_to_cloudinary(file_path: str, workspace_id: str) -> str:
    """
    Upload a local dataset file to Cloudinary and return the secure URL.

    Args:
        file_path:    Absolute / relative path to the file on disk.
        workspace_id: Used as the Cloudinary public_id so the file can be
                      overwritten on re-upload (same workspace, new dataset).

    Returns:
        secure_url (str)
    """
    _init_cloudinary()

    # Use workspace_id as the unique identifier inside the mlverse folder
    public_id = f"mlverse/datasets/{workspace_id}"

    result = cloudinary.uploader.upload(
        file_path,
        public_id=public_id,
        resource_type="raw",   # CSV / Excel are raw (not image/video)
        overwrite=True,        # Allow re-upload if workspace dataset changes
        use_filename=True,
        unique_filename=False,
    )

    return result["secure_url"]


def download_dataset_from_cloudinary(url: str, dest_path: str) -> str:
    """
    Download a raw file from Cloudinary to a local path.

    Args:
        url:       Cloudinary secure_url for the dataset.
        dest_path: Local file path to write the downloaded file to.

    Returns:
        dest_path (str) – same as input, for convenience.
    """
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    response = requests.get(url, timeout=60)
    response.raise_for_status()

    with open(dest_path, "wb") as f:
        f.write(response.content)

    return dest_path


def delete_dataset_from_cloudinary(workspace_id: str) -> bool:
    """
    Permanently delete the dataset stored for *workspace_id* from Cloudinary.

    The public_id follows the same convention used during upload:
        mlverse/datasets/<workspace_id>

    Returns:
        True  – resource was found and deleted (result == "ok").
        False – resource was not found or deletion failed.
    """
    _init_cloudinary()

    public_id = f"mlverse/datasets/{workspace_id}.csv"

    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="raw")
        print("public id:",public_id)
        print("result :",result.get("result"))
        return result.get("result") == "ok"
    except Exception:
        return False
