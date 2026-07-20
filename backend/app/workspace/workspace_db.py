from datetime import datetime, timezone
from backend.db.mongodb import get_mongo_db


COLLECTION = "workspaces"


def create_workspace_doc(workspace_id: str, workspace_name: str, owner: str) -> dict:
    """
    Insert a full workspace document into MongoDB and return it.
    The document follows the canonical schema defined in Phase 1.
    """
    db = get_mongo_db()
    created_at = datetime.now(timezone.utc).isoformat()

    doc = {
        "metadata": {
            "workspace_id": workspace_id,
            "workspace_name": workspace_name,
            "owner": owner,
            "created_at": created_at,
            "dataset_uri":None
        },
        "pipeline": {
            "remove_columns": [],
            "missing_values": {},
            "encoding": {},
            "scaling": {},
            "target_column": None,
            "ml_category": None,
            "ml_type": None,
        },
        "state": {
            "current_step": "dataset_upload",
            "dataset_uploaded": False,
            "pipeline_built": False,
            "dataset_status": "empty",
            "model_status": "not_trained",
            "results_status": "empty",
        },
    }

    db[COLLECTION].insert_one(doc)

    # Remove MongoDB's internal _id before returning
    doc.pop("_id", None)
    return doc


def get_workspace_meta(workspace_id: str) -> dict | None:
    """
    Return only the *metadata* sub-document for the given workspace_id,
    or None if not found.
    """
    db = get_mongo_db()
    doc = db[COLLECTION].find_one(
        {"metadata.workspace_id": workspace_id},
        {"_id": 0, "metadata": 1}
    )
    return doc["metadata"] if doc else None


def get_workspace_doc(workspace_id: str) -> dict | None:
    """
    Return the complete workspace document for the given workspace_id,
    or None if not found.
    """
    db = get_mongo_db()
    doc = db[COLLECTION].find_one(
        {"metadata.workspace_id": workspace_id},
        {"_id": 0}
    )
    return doc


# ------------------------------------------------------------------
# Phase 2 – State persistence helpers
# ------------------------------------------------------------------

def update_dataset_uri(workspace_id: str, uri: str) -> None:
    """
    Persist the Cloudinary URL of the original (unmodified) dataset.
    Also marks the dataset as uploaded and advances current_step to 'eda'.
    """
    db = get_mongo_db()
    db[COLLECTION].update_one(
        {"metadata.workspace_id": workspace_id},
        {
            "$set": {
                "metadata.dataset_uri": uri,
                "state.dataset_uploaded": True,
                "state.dataset_status": "uploaded",
                "state.current_step": "eda",
            }
        },
    )


def update_pipeline_step(workspace_id: str, step_key: str, step_value) -> None:
    """
    Overwrite a single field inside the `pipeline` sub-document.

    Example:
        update_pipeline_step(wid, "remove_columns", ["col_a", "col_b"])
        update_pipeline_step(wid, "missing_values", {"Age": "mean"})
    """
    db = get_mongo_db()
    db[COLLECTION].update_one(
        {"metadata.workspace_id": workspace_id},
        {"$set": {f"pipeline.{step_key}": step_value}},
    )


def set_current_step(workspace_id: str, step_name: str) -> None:
    """
    Advance (or rewind) the `state.current_step` field.
    """
    db = get_mongo_db()
    db[COLLECTION].update_one(
        {"metadata.workspace_id": workspace_id},
        {"$set": {"state.current_step": step_name}},
    )


def set_pipeline_built(workspace_id: str, target_column: str) -> None:
    """
    Mark the pipeline as fully built and store the target column.
    """
    db = get_mongo_db()
    db[COLLECTION].update_one(
        {"metadata.workspace_id": workspace_id},
        {
            "$set": {
                "pipeline.target_column": target_column,
                "state.pipeline_built": True,
                "state.current_step": "model_selection",
            }
        },
    )


def set_ml_category(workspace_id: str, ml_category: str, ml_type: str) -> None:
    """
    Persist the ML category (supervised/unsupervised) and type (regression,
    classification, clustering, etc.) chosen by the user for this workspace.
    Also advances current_step to 'dataset_upload' so that a fresh workspace
    that already has a category can resume correctly.
    """
    db = get_mongo_db()
    db[COLLECTION].update_one(
        {"metadata.workspace_id": workspace_id},
        {
            "$set": {
                "pipeline.ml_category": ml_category,
                "pipeline.ml_type": ml_type,
                "state.current_step": "dataset_upload",
            }
        },
    )


def clear_pipeline_from_step(workspace_id: str, target_step: str) -> None:
    """
    Clear pipeline fields that are at or after the target step when navigating backwards.
    """
    db = get_mongo_db()
    updates = {}
    
    if target_step in ["dataset_upload", "eda"]:
        updates = {
            "pipeline.remove_columns": [],
            "pipeline.missing_values": {},
            "pipeline.encoding": {},
            "pipeline.scaling": {},
            "pipeline.target_column": None,
            "state.pipeline_built": False,
        }
    elif target_step == "missing_values":
        updates = {
            "pipeline.remove_columns": [],
            "pipeline.missing_values": {},
            "pipeline.encoding": {},
            "pipeline.scaling": {},
            "pipeline.target_column": None,
            "state.pipeline_built": False,
        }
    elif target_step in ["encoding", "scaling", "feature_engineering"]:
        updates = {
            "pipeline.encoding": {},
            "pipeline.scaling": {},
            "pipeline.target_column": None,
            "state.pipeline_built": False,
        }
    elif target_step == "model_selection":
        updates = {
            "pipeline.target_column": None,
            "state.pipeline_built": False,
        }

    if updates:
        db[COLLECTION].update_one(
            {"metadata.workspace_id": workspace_id},
            {"$set": updates}
        )


def delete_workspace_doc(workspace_id: str) -> bool:
    """
    Delete the workspace document from MongoDB.

    Returns True if a document was deleted, False if none matched.
    """
    db = get_mongo_db()
    result = db[COLLECTION].delete_one({"metadata.workspace_id": workspace_id})
    return result.deleted_count > 0

