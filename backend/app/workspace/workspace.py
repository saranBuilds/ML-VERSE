import os
import uuid

import pandas as pd
from flask import Blueprint, request, jsonify, session
# pyrefly: ignore [missing-import]
from werkzeug.utils import secure_filename

from backend.app.authentication.jwt import token_required
from backend.db.mysql import (
    create_user_workspace_row,
    get_workspace_slots,
    add_workspace_id,
    get_all_workspace_ids,
    remove_workspace_id,
)
from backend.app.workspace.workspace_db import (
    create_workspace_doc,
    get_workspace_meta,
    get_workspace_doc,
    set_current_step,
    delete_workspace_doc,
    clear_pipeline_from_step,
)

workspace_bp = Blueprint("workspace", __name__)

UPLOAD_FOLDER = "uploads"

# ──────────────────────────────────────────────────────────────────────────────
# Reconstruction helpers
# ──────────────────────────────────────────────────────────────────────────────

def _load_df_from_path(path: str) -> pd.DataFrame:
    """Read CSV or Excel into a DataFrame and convert dtypes."""
    if path.endswith(".csv"):
        df = pd.read_csv(path)
    else:
        df = pd.read_excel(path)
    return df.convert_dtypes()


def _reconstruct_df(doc: dict, up_to_step: str) -> pd.DataFrame:
    """
    Download the original dataset from Cloudinary and replay saved pipeline
    transformations up to (but not including) `up_to_step`.

    Step order:
        eda → remove_columns → missing_values → encoding → scaling → feature_engineering
    """
    from backend.app.cloudinary_utils import download_dataset_from_cloudinary
    from backend.app.Main.utils import (
        remove_columns,
        apply_missing_strategy,
        encode_categorical_columns,
        feature_scale,
    )

    dataset_uri = doc.get("metadata", {}).get("dataset_uri")
    if not dataset_uri:
        raise ValueError("No dataset_uri stored in workspace. Please upload a dataset first.")

    # Determine local destination filename from the Cloudinary URL
    url_basename = dataset_uri.split("/")[-1].split("?")[0]
    workspace_id  = doc["metadata"]["workspace_id"]

    # Strip any Cloudinary-appended extension duplicates safely
    if "." not in url_basename:
        url_basename = f"{workspace_id}_original.csv"

    dest_path = os.path.join(UPLOAD_FOLDER, f"reconstructed_{workspace_id}_{url_basename}")
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

    download_dataset_from_cloudinary(dataset_uri, dest_path)
    df = _load_df_from_path(dest_path)

    pipeline = doc.get("pipeline", {})

    # Determine which transformations to apply based on the target step
    apply_remove_cols = False
    apply_missing = False
    apply_encoding = False
    apply_scaling = False

    if up_to_step in ["dataset_upload", "missing_values"]:
        # Raw dataset or starting cleaning
        pass
    elif up_to_step in ["eda", "encoding", "scaling", "feature_engineering"]:
        # Cleaning completed
        apply_remove_cols = True
        apply_missing = True
    elif up_to_step in ["model_selection", "model_training", "app_deployment"]:
        # Cleaning and feature engineering completed
        apply_remove_cols = True
        apply_missing = True
        apply_encoding = True
        apply_scaling = True
    else:
        # Default: apply everything
        apply_remove_cols = True
        apply_missing = True
        apply_encoding = True
        apply_scaling = True

    # 1. Remove columns
    remove_cols = pipeline.get("remove_columns", [])
    if remove_cols and apply_remove_cols:
        df = remove_columns(df, remove_cols)

    # 2. Missing values
    missing_strategy = pipeline.get("missing_values", {})
    if missing_strategy and apply_missing:
        df = apply_missing_strategy(df, missing_strategy)

    # 3. Encoding
    encoding_strategy = pipeline.get("encoding", {})
    if encoding_strategy and apply_encoding:
        df = encode_categorical_columns(df, encoding_strategy)

    # 4. Scaling
    scaling_strategy = pipeline.get("scaling", {})
    if scaling_strategy and apply_scaling:
        df = feature_scale(df, scaling_strategy)

    return df, dest_path



# ──────────────────────────────────────────────────────────────────────────────
# Step name → React activeStep index
# ──────────────────────────────────────────────────────────────────────────────

STEP_TO_INDEX = {
    "dataset_upload":     1,
    "eda":                4,   # jump straight to EDA (skips preview)
    "missing_values":     3,   # DataCleaning
    "encoding":           5,   # FeatureEngineering
    "scaling":            5,
    "feature_engineering": 5,
    "model_selection":    6,
    "model_training":     7,
}


# ──────────────────────────────────────────────────────────────────────────────
# POST /workspace/create
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/create", methods=["POST"])
@token_required
def create_workspace(token_data):
    """
    Create a new workspace for the authenticated user.

    Body (JSON):
        { "workspace_name": "<name>" }

    Returns the new workspace metadata on success.
    """
    username = token_data["user"]
    data = request.get_json(silent=True) or {}
    workspace_name = data.get("workspace_name", "").strip()

    if not workspace_name:
        return jsonify({"error": "workspace_name is required"}), 400

    # --- Enforce 5-workspace limit ---
    create_user_workspace_row(username)

    slots = get_workspace_slots(username)
    if slots and slots["total_workspace"] >= 5:
        return jsonify({"error": "Workspace limit reached. Maximum 5 workspaces allowed."}), 409

    # --- Generate unique workspace ID ---
    workspace_id = str(uuid.uuid4())

    # --- Persist to MongoDB ---
    doc = create_workspace_doc(workspace_id, workspace_name, username)

    # --- Persist to MySQL ---
    success = add_workspace_id(username, workspace_id)
    if not success:
        return jsonify({"error": "Could not allocate workspace slot. Please try again."}), 500

    meta = doc["metadata"]
    return jsonify({
        "message": "Workspace created successfully",
        "workspace_id":   meta["workspace_id"],
        "workspace_name": meta["workspace_name"],
        "owner":          meta["owner"],
        "created_at":     meta["created_at"],
    }), 201


# ──────────────────────────────────────────────────────────────────────────────
# GET /workspace/list
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/list", methods=["GET"])
@token_required
def list_workspaces(token_data):
    """
    Return a summary list of all workspaces belonging to the user.
    Includes current_step so the frontend can display a status badge.

    Response:
        { "workspaces": [ { workspace_id, workspace_name, created_at, current_step }, ... ] }
    """
    username = token_data["user"]

    workspace_ids = get_all_workspace_ids(username)

    if not workspace_ids:
        return jsonify({"workspaces": []}), 200

    workspaces = []
    for wid in workspace_ids:
        doc = get_workspace_doc(wid)
        if doc:
            meta  = doc.get("metadata", {})
            state = doc.get("state", {})
            workspaces.append({
                "workspace_id":   meta.get("workspace_id"),
                "workspace_name": meta.get("workspace_name"),
                "created_at":     meta.get("created_at"),
                "current_step":   state.get("current_step", "dataset_upload"),
                "dataset_uploaded": state.get("dataset_uploaded", False),
            })

    return jsonify({"workspaces": workspaces}), 200


# ──────────────────────────────────────────────────────────────────────────────
# GET /workspace/open/<workspace_id>
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/open/<workspace_id>", methods=["GET"])
@token_required
def open_workspace(token_data, workspace_id):
    """
    Open a workspace by ID.  Validates ownership then returns the
    full workspace document so the frontend can restore pipeline state.

    Response:
        Complete workspace JSON including state.current_step
    """
    username = token_data["user"]

    owned_ids = get_all_workspace_ids(username)
    if workspace_id not in owned_ids:
        return jsonify({"error": "Workspace not found or access denied"}), 403

    doc = get_workspace_doc(workspace_id)
    if not doc:
        return jsonify({"error": "Workspace document not found"}), 404

    return jsonify({
        "message": "Workspace loaded successfully",
        "workspace": doc,
        "current_step": doc["state"]["current_step"],
    }), 200


# ──────────────────────────────────────────────────────────────────────────────
# POST /workspace/continue/<workspace_id>   ← NEW Phase 2
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/continue/<workspace_id>", methods=["POST","GET"])
@token_required
def continue_workspace(token_data, workspace_id):
    """
    Restore a workspace session from MongoDB + Cloudinary.

    Steps:
    1. Validate ownership.
    2. Load full workspace doc.
    3. Download original dataset from Cloudinary.
    4. Replay all pipeline steps saved so far.
    5. Write rebuilt dataframe to a local temp file.
    6. Store session vars: workspace_id, dataset_path, current_step.
    7. Return workspace metadata + numeric activeStep for React.

    Response:
        {
          "workspace":     { ...full doc... },
          "current_step":  "encoding",
          "active_step":   5,
          "columns":       [...],
        }
    """
    username = token_data["user"]

    # 1. Ownership
    owned_ids = get_all_workspace_ids(username)
    if workspace_id not in owned_ids:
        return jsonify({"error": "Workspace not found or access denied"}), 403

    # 2. Load doc
    doc = get_workspace_doc(workspace_id)
    if not doc:
        return jsonify({"error": "Workspace document not found"}), 404

    current_step = doc["state"].get("current_step", "dataset_upload")
    dataset_uri  = doc["metadata"].get("dataset_uri")

    # 3+4+5. If there's a dataset, reconstruct
    reconstructed_path = None
    columns = []

    if dataset_uri and current_step != "dataset_upload":
        try:
            df, reconstructed_path = _reconstruct_df(doc, current_step)
            columns = list(df.columns)

            # 5. Persist rebuilt dataframe to disk for use by pipeline routes
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            if reconstructed_path.endswith(".xlsx") or reconstructed_path.endswith(".xls"):
                df.to_excel(reconstructed_path, index=False)
            else:
                # Always save as CSV for simplicity
                csv_path = reconstructed_path.rsplit(".", 1)[0] + ".csv"
                df.to_csv(csv_path, index=False)
                reconstructed_path = csv_path

        except Exception as e:
            import traceback
            traceback.print_exc()
            return jsonify({"error": f"Dataset reconstruction failed: {str(e)}"}), 500

    # 6. Set session
    session["workspace_id"]  = workspace_id
    session["current_step"]  = current_step
    if reconstructed_path:
        session["dataset_path"] = reconstructed_path

    # Store columns in session for DataCleaning page
    if columns:
        session["columns"] = columns

    # 7. Restore ml_category / ml_type from MongoDB pipeline → session
    pipeline = doc.get("pipeline", {})
    ml_category = pipeline.get("ml_category")
    ml_type     = pipeline.get("ml_type")
    if ml_category:
        session["ml_category"] = ml_category
    if ml_type:
        session["ml_type"] = ml_type

    # Determine active step:
    # - If no category has been selected yet → force step 0 (category selection)
    # - Otherwise use the persisted current_step → numeric index
    if not ml_category or not ml_type:
        active_step = 0
    else:
        active_step = STEP_TO_INDEX.get(current_step, 1)

    return jsonify({
        "message":      "Workspace restored successfully",
        "workspace":    doc,
        "current_step": current_step,
        "active_step":  active_step,
        "columns":      columns,
        "ml_category":  ml_category,
        "ml_type":      ml_type,
    }), 200


# ──────────────────────────────────────────────────────────────────────────────
# DELETE /workspace/delete/<workspace_id>
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/delete/<workspace_id>", methods=["DELETE"])
@token_required
def delete_workspace(token_data, workspace_id):
    """
    Permanently delete a workspace and all associated data:
      1. Validate ownership.
      2. Delete the dataset file from Cloudinary (best-effort).
      3. Delete the workspace document from MongoDB.
      4. Clear the workspace slot in MySQL and decrement the counter.
      5. Delete any locally reconstructed dataset files from disk.

    Returns:
        { "message": "Workspace deleted successfully" } on success.
    """
    from backend.app.cloudinary_utils import delete_dataset_from_cloudinary

    username = token_data["user"]

    # 1. Validate ownership
    owned_ids = get_all_workspace_ids(username)
    if workspace_id not in owned_ids:
        return jsonify({"error": "Workspace not found or access denied"}), 403

    # 2. Delete from Cloudinary (best-effort — do not fail if not uploaded yet)
    delete_dataset_from_cloudinary(workspace_id)

    # 3. Delete from MongoDB
    delete_workspace_doc(workspace_id)

    # 4. Clear MySQL slot
    remove_workspace_id(username, workspace_id)

    # 5. Clean up any local reconstructed files
    try:
        for fname in os.listdir(UPLOAD_FOLDER):
            if workspace_id in fname:
                try:
                    os.remove(os.path.join(UPLOAD_FOLDER, fname))
                except OSError:
                    pass
    except FileNotFoundError:
        pass  # uploads folder doesn't exist yet — nothing to clean

    return jsonify({"message": "Workspace deleted successfully"}), 200


# ──────────────────────────────────────────────────────────────────────────────
# POST /workspace/update_step/<workspace_id>
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/update_step/<workspace_id>", methods=["POST"])
@token_required
def update_step(token_data, workspace_id):
    """
    Persist the current pipeline step for a workspace, even if no pipeline
    operation was performed (e.g. user just visited/passed through a step).

    Body (JSON):
        { "step": "<step_name>" }

    Valid step names: dataset_upload, eda, missing_values, encoding,
                      scaling, feature_engineering, model_selection, model_training
    """
    VALID_STEPS = {
        "dataset_upload", "eda", "missing_values", "encoding",
        "scaling", "feature_engineering", "model_selection", "model_training",
    }

    username = token_data["user"]

    # Validate ownership
    owned_ids = get_all_workspace_ids(username)
    if workspace_id not in owned_ids:
        return jsonify({"error": "Workspace not found or access denied"}), 403

    data = request.get_json(silent=True) or {}
    step_name = data.get("step", "").strip()

    if not step_name or step_name not in VALID_STEPS:
        return jsonify({"error": f"Invalid or missing step name. Valid steps: {sorted(VALID_STEPS)}"}), 400

    try:
        set_current_step(workspace_id, step_name)
    except Exception as e:
        return jsonify({"error": f"Failed to update step: {str(e)}"}), 500

    return jsonify({"message": f"current_step updated to '{step_name}'", "current_step": step_name}), 200


# ──────────────────────────────────────────────────────────────────────────────
# POST /workspace/rebuild/<workspace_id>
# ──────────────────────────────────────────────────────────────────────────────

@workspace_bp.route("/rebuild/<workspace_id>", methods=["POST"])
@token_required
def rebuild_workspace(token_data, workspace_id):
    """
    Rebuild the dataset by replaying transformations up to target_step,
    clearing any downstream pipeline configurations.
    """
    VALID_STEPS = {
        "dataset_upload", "eda", "missing_values", "encoding",
        "scaling", "feature_engineering", "model_selection", "model_training",
    }

    username = token_data["user"]

    # Validate ownership
    owned_ids = get_all_workspace_ids(username)
    if workspace_id not in owned_ids:
        return jsonify({"error": "Workspace not found or access denied"}), 403

    data = request.get_json(silent=True) or {}
    target_step = data.get("target_step", "").strip()

    if not target_step or target_step not in VALID_STEPS:
        return jsonify({"error": f"Invalid or missing target step. Valid steps: {sorted(VALID_STEPS)}"}), 400

    try:
        # 1. Clear pipeline elements from target_step onwards
        clear_pipeline_from_step(workspace_id, target_step)

        # 2. Get updated workspace doc
        doc = get_workspace_doc(workspace_id)
        if not doc:
            return jsonify({"error": "Workspace document not found"}), 404

        dataset_uri = doc["metadata"].get("dataset_uri")
        columns = []
        reconstructed_path = None

        # 3. Reconstruct dataframe up to the target_step
        if dataset_uri:
            df, reconstructed_path = _reconstruct_df(doc, target_step)
            columns = list(df.columns)

            # Persist to disk
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            if reconstructed_path.endswith(".xlsx") or reconstructed_path.endswith(".xls"):
                df.to_excel(reconstructed_path, index=False)
            else:
                csv_path = reconstructed_path.rsplit(".", 1)[0] + ".csv"
                df.to_csv(csv_path, index=False)
                reconstructed_path = csv_path

        # 4. Set session
        session["workspace_id"] = workspace_id
        session["current_step"] = target_step
        if reconstructed_path:
            session["dataset_path"] = reconstructed_path
        if columns:
            session["columns"] = columns

        # 5. Set step in MongoDB
        set_current_step(workspace_id, target_step)

        # Map step to numeric React index
        active_step = STEP_TO_INDEX.get(target_step, 1)

        return jsonify({
            "message": "Pipeline rebuilt successfully",
            "columns": columns,
            "current_step": target_step,
            "active_step": active_step
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Rebuild failed: {str(e)}"}), 500

