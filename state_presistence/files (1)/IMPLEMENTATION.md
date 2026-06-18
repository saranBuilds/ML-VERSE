# ML Verse V2 - Sprint 1: State Persistence Implementation

## 📋 Overview

Sprint 1 implements workspace-based state persistence with three core JSON files per workspace:
- **metadata.json** - Permanent workspace information
- **state.json** - Current progress tracking
- **pipeline.json** - Single source of truth for preprocessing configuration

---

## 🏗️ Architecture

### WorkspaceManager Class

Located in: `workspace_manager.py`

**Responsibilities:**
- Create workspaces with full structure
- Load workspaces after relogin
- Update state and pipeline configurations
- Handle STRICT and GRACEFUL error modes

**Key Methods:**

```python
# Create workspace with metadata, state, pipeline
workspace_path = manager.create_workspace(user, workspace_name)

# Load all workspace files after login
workspace_data = manager.load_workspace(user, workspace_name)

# Update state field
manager.update_state(workspace_path, "dataset_uploaded", True)

# Update pipeline section
manager.update_pipeline(workspace_path, "encoding", {"gender": "label"})

# List user workspaces
workspaces = manager.list_workspaces(user)

# Rename workspace
manager.rename_workspace(user, old_name, new_name)

# Delete workspace
manager.delete_workspace(user, workspace_name)
```

---

## 📁 Workspace Structure

```
workspace/
└── user/
    └── workspace_name/
        ├── metadata.json          ← Permanent info
        ├── state.json            ← Progress tracking
        ├── pipeline.json         ← Preprocessing config
        │
        ├── data/                 ← Generated artifacts (GRACEFUL)
        │   ├── original_dataset.csv
        │   └── processed_dataset.csv
        │
        ├── preprocessing/        ← Generated artifacts (GRACEFUL)
        ├── models/              ← Generated artifacts (GRACEFUL)
        ├── results/             ← Generated artifacts (GRACEFUL)
        ├── reports/             ← Generated artifacts (GRACEFUL)
        ├── logs/                ← Generated artifacts (GRACEFUL)
        └── versions/            ← Generated artifacts (GRACEFUL)
```

---

## 📄 JSON File Structures

### metadata.json (STRICT - Created Once)

```json
{
    "workspace_id": "a1b2c3d4",
    "workspace_name": "HeartDisease",
    "owner": "test02",
    "created_at": "2026-06-16T10:30:00.123456"
}
```

**Rules:**
- Created once during workspace creation
- Rarely modified
- Only field that changes: `workspace_name` (during rename)

---

### state.json (STRICT - Progress Tracking)

```json
{
    "current_step": "dataset_upload",
    "dataset_uploaded": false,
    "pipeline_built": false,
    "dataset_status": "empty",
    "model_status": "not_trained",
    "results_status": "empty"
}
```

**Field Values:**

| Field | Possible Values | Meaning |
|-------|-----------------|---------|
| `current_step` | dataset_upload, remove_columns, missing_values, encoding, scaling, training, evaluation | Current pipeline step |
| `dataset_uploaded` | true, false | Dataset uploaded to workspace |
| `pipeline_built` | true, false | Pipeline configuration complete |
| `dataset_status` | empty, dirty, valid | Processed dataset validity |
| `model_status` | not_trained, invalid, trained | Model training status |
| `results_status` | empty, invalid, valid | Results/metrics validity |

---

### pipeline.json (STRICT - Single Source of Truth)

```json
{
    "remove_columns": [],
    "missing_values": {},
    "encoding": {},
    "scaling": {},
    "target_column": null
}
```

**Examples:**

```json
{
    "remove_columns": ["ID", "Phone"],
    "missing_values": {
        "Age": "mean",
        "Income": "median"
    },
    "encoding": {
        "Gender": "label",
        "Country": "onehot"
    },
    "scaling": {
        "method": "standardscaler",
        "features": ["Age", "Income", "Score"]
    },
    "target_column": "Disease"
}
```

---

## 🛡️ Error Handling Strategy

### STRICT MODE: Workspace Files

**Files:** metadata.json, state.json, pipeline.json

**Behavior:**
- File missing → Raise `FileNotFoundError` immediately
- File corrupted → Raise `json.JSONDecodeError` immediately
- Prevent workspace from being used
- Fail fast - preserve data integrity

**Example:**
```python
try:
    workspace = manager.load_workspace("test02", "MyWorkspace")
except FileNotFoundError:
    # metadata.json, state.json, or pipeline.json missing
    # Cannot proceed - workspace data corrupted
    print("❌ Critical: Workspace files missing. Cannot load workspace.")
except json.JSONDecodeError:
    # Files exist but are corrupted
    print("❌ Critical: Workspace files corrupted. Cannot load workspace.")
```

### GRACEFUL MODE: Generated Artifacts

**Files:** models/, reports/, logs/, metrics/, versions/

**Behavior:**
- Directory missing → Log warning, continue
- File missing → Log warning, continue
- Regenerate on next pipeline run
- Don't block workflow

**Example:**
```python
# During workspace load:
⚠️  Warning: Artifact directory 'models' missing. Will be created on next run.

# Continues loading successfully
```

---

## 🔄 Workflow Examples

### Example 1: Create Workspace (First Time)

```python
manager = WorkspaceManager(workspace_root="workspace", max_workspaces=5)

# User creates workspace
path = manager.create_workspace("test02", "HeartDisease")

# Creates:
# workspace/test02/HeartDisease/
# ├── metadata.json (initial)
# ├── state.json (initial)
# ├── pipeline.json (initial)
# └── [data/, models/, results/, etc.]
```

### Example 2: Load Workspace (After Relogin)

```python
# User logs in again
workspace_data = manager.load_workspace("test02", "HeartDisease")

# Returns:
{
    "workspace_path": "workspace/test02/HeartDisease",
    "metadata": {...},
    "state": {...},
    "pipeline": {...}
}

# Use current_step to restore UI state
current_step = workspace_data["state"]["current_step"]
# Open appropriate page (encoding, scaling, etc.)
```

### Example 3: Update State During Pipeline


### Example 4: Update Pipeline Configuration



### Example 5: Invalidate Artifacts on Pipeline Change

---

## 🎮 CLI Usage

Run the main script:

```bash
python main.py
```

**Menu Options:**

1. **Create Workspace** - Create new workspace with state persistence
2. **List Workspaces** - Show all user workspaces
3. **Load Workspace** - Load and display workspace details
4. **Rename Workspace** - Rename existing workspace
5. **work on Workspace** - work on workspace
6. **Delete Workspace** - Delete workspace completely
7. **Exit** - Exit program

### Example Session:

```
$ python main.py

🚀 ML VERSE - User: test02
   Workspace Root: workspace
   Max Workspaces: 5

============================================================
📋 MENU
============================================================
1. ✨ Create Workspace
...
Choice: 1

Workspace Name: HeartDisease

✅ Workspace created successfully.
   Name : HeartDisease
   Path : workspace/test02/HeartDisease

============================================================
📋 MENU
============================================================
...
Choice: 3

Workspace to load: HeartDisease

============================================================
📦 WORKSPACE LOADED
============================================================

🔹 METADATA
   Workspace ID   : a1b2c3d4
   Workspace Name : HeartDisease
   Owner          : test02
   Created At     : 2026-06-16T10:30:00.123456

🔹 STATE
   Current Step    : dataset_upload
   Dataset Uploaded: False
   Pipeline Built  : False
   Dataset Status  : empty
   Model Status    : not_trained
   Results Status  : empty

🔹 PIPELINE CONFIGURATION
   Remove Columns  : []
   Missing Values  : {}
   Encoding        : {}
   Scaling         : {}
   Target Column   : None

============================================================
```

---

## 🚀 Running Tests

The implementation is ready to use. Test workflow:

```python
from workspace_manager import WorkspaceManager

manager = WorkspaceManager()

# 1. Create
path = manager.create_workspace("test02", "TestWorkspace")
print(f"✅ Created: {path}")

# 2. Load
data = manager.load_workspace("test02", "TestWorkspace")
print(f"✅ Loaded: {data['workspace_path']}")

# 3. Update state
manager.update_state(path, "dataset_uploaded", True)
print(f"✅ Updated state")

# 4. Update pipeline
manager.update_pipeline(path, "encoding", {"col1": "label"})
print(f"✅ Updated pipeline")

# 5. Load again to verify persistence
data = manager.load_workspace("test02", "TestWorkspace")
assert data["state"]["dataset_uploaded"] == True
assert data["pipeline"]["encoding"] == {"col1": "label"}
print(f"✅ Persistence verified!")

# 6. Clean up
manager.delete_workspace("test02", "TestWorkspace")
print(f"✅ Deleted workspace")
```

---

## 🔐 Data Integrity

### Source of Truth Principle

```
processed_dataset.csv = load(original_dataset.csv) + apply(pipeline.json)
trained_model.pkl = train(processed_dataset.csv)
metrics.json = evaluate(trained_model.pkl)
```

**Never use generated files as source data.**

When pipeline.json changes:
- Mark processed_dataset as "dirty"
- Mark trained_model as "invalid"
- Mark metrics as "invalid"
- Regenerate on next run

---

## 📊 State Transitions

```
DATASET UPLOAD
  └─ dataset_status: empty → valid
  └─ current_step: dataset_upload

PREPROCESSING (Missing Values)
  └─ current_step: missing_values
  └─ pipeline.json: missing_values section updated

PREPROCESSING (Encoding)
  └─ current_step: encoding
  └─ pipeline.json: encoding section updated
  └─ Mark: dataset_status = dirty (regenerate processed dataset)

PREPROCESSING (Scaling)
  └─ current_step: scaling
  └─ pipeline.json: scaling section updated

TRAINING
  └─ current_step: training
  └─ model_status: not_trained → trained
  └─ Requires: valid processed_dataset

EVALUATION
  └─ current_step: evaluation
  └─ results_status: empty → valid
  └─ Requires: trained model
```

---

## 📝 Sprint 1 Completion Checklist

- ✅ WorkspaceManager class with STRICT/GRACEFUL error handling
- ✅ create_workspace() - Creates metadata.json, state.json, pipeline.json
- ✅ load_workspace() - Loads all three files
- ✅ update_state() - Updates state fields
- ✅ update_pipeline() - Updates pipeline sections
- ✅ Folder structure with generated artifact directories
- ✅ Index file (workspace_index.json) for quick lookup
- ✅ Refactored CLI using WorkspaceManager
- ✅ Error handling (STRICT for workspace files, GRACEFUL for artifacts)
- ✅ Documentation

---

## 🔮 Next Steps (Sprint 2+)

**Sprint 2:** PipelineManager
- load_pipeline(), save_pipeline()
- mark_dirty(), validate_pipeline()
- Dirty flag system

**Sprint 3:** DatasetBuilder
- Load original_dataset.csv
- Apply pipeline configuration
- Generate processed_dataset.csv

**Sprint 4:** ClassificationPipeline
- train_model(), evaluate_model()
- save_model(), predict()

**Sprint 5:** Workspace Restore
- Auto-restore UI state based on current_step

**Sprint 6:** Versioning
- Pipeline snapshots
- Version comparison
- Rollback functionality

---

## 📞 Support

For questions or issues:
1. Check error messages - they indicate STRICT vs GRACEFUL failures
2. Verify JSON files exist in workspace directory
3. Check permissions on workspace folder
4. Review state.json and pipeline.json structure
