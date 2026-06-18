import os
import json
import uuid
import shutil
from datetime import datetime
from typing import Dict, Any, Optional


class WorkspaceManager:
    """
    Manages workspace creation, loading, and state persistence.
    
    Responsibilities:
    - Create workspaces with metadata.json, state.json, pipeline.json
    - Load workspace files after relogin
    - Update state and pipeline configurations
    - STRICT error handling for workspace files
    - GRACEFUL error handling for generated artifacts
    """

    def __init__(self, workspace_root: str = "workspace", max_workspaces: int = 5):
        self.workspace_root = workspace_root
        self.max_workspaces = max_workspaces

    # ============================================================================
    # JSON TEMPLATES
    # ============================================================================

    @staticmethod
    def _get_metadata_template(workspace_id: str, workspace_name: str, owner: str) -> Dict[str, Any]:
        """Template for metadata.json - permanent workspace information"""
        return {
            "workspace_id": workspace_id,
            "workspace_name": workspace_name,
            "owner": owner,
            "created_at": datetime.now().isoformat()
        }

    @staticmethod
    def _get_state_template() -> Dict[str, Any]:
        """Template for state.json - current progress tracking"""
        return {
            "current_step": "dataset_upload",
            "dataset_uploaded": False,
            "pipeline_built": False,
            "dataset_status": "empty",  # empty, dirty, valid
            "model_status": "not_trained",  # not_trained, invalid, trained
            "results_status": "empty",  # empty, invalid, valid
            "learning_type" :"empty" # empty,classification,regression,clustering
        }

    @staticmethod
    def _get_pipeline_template() -> Dict[str, Any]:
        """Template for pipeline.json - single source of truth for preprocessing"""
        return {
            "remove_columns": [],
            "missing_values": {},
            "encoding": {},
            "scaling": {},
            "target_column": None
        }

    # ============================================================================
    # FOLDER STRUCTURE
    # ============================================================================

    @staticmethod
    def _create_folder_structure(base_path: str) -> None:
        """Create workspace folder structure"""
        folders = [
            "data",
            "preprocessing",
            "models",
            "results",
            "reports",
            "logs",
            "versions"
        ]
        
        for folder in folders:
            folder_path = os.path.join(base_path, folder)
            os.makedirs(folder_path, exist_ok=True)

    # ============================================================================
    # STRICT MODE: WORKSPACE FILES
    # ============================================================================

    def _save_workspace_file(self, filepath: str, data: Dict[str, Any], file_type: str) -> None:
        """
        Save workspace file with STRICT error handling.
        
        Raises:
            IOError: If file cannot be written
        """
        try:
            with open(filepath, "w") as f:
                json.dump(data, f, indent=4)
        except IOError as e:
            raise IOError(f"Failed to save {file_type} at {filepath}: {str(e)}")

    def _load_workspace_file(self, filepath: str, file_type: str) -> Dict[str, Any]:
        """
        Load workspace file with STRICT error handling.
        
        Raises:
            FileNotFoundError: If file doesn't exist
            json.JSONDecodeError: If file is corrupted
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"{file_type} not found at {filepath}")
        
        try:
            with open(filepath, "r") as f:
                data = json.load(f)
            return data
        except json.JSONDecodeError as e:
            raise json.JSONDecodeError(
                f"Corrupted {file_type} at {filepath}: {str(e)}",
                e.doc,
                e.pos
            )

    # ============================================================================
    # GRACEFUL MODE: GENERATED ARTIFACTS
    # ============================================================================

    def _ensure_artifact_dirs(self, base_path: str) -> None:
        """
        Ensure generated artifact directories exist.
        Graceful - log warning if cannot create but continue.
        """
        artifact_dirs = ["models", "results", "reports", "logs", "versions"]
        
        for dirname in artifact_dirs:
            try:
                dirpath = os.path.join(base_path, dirname)
                os.makedirs(dirpath, exist_ok=True)
            except Exception as e:
                print(f"⚠️  Warning: Could not ensure artifact directory '{dirname}': {str(e)}")

    def _validate_artifact_dirs(self, base_path: str) -> None:
        """
        Check artifact directories exist. Graceful - warn but continue.
        """
        artifact_dirs = ["models", "results", "reports", "logs", "versions"]
        
        for dirname in artifact_dirs:
            dirpath = os.path.join(base_path, dirname)
            if not os.path.exists(dirpath):
                print(f"⚠️  Warning: Artifact directory '{dirname}' missing. Will be created on next run.")

    # ============================================================================
    # CREATE WORKSPACE
    # ============================================================================

    def create_workspace(self, user: str, workspace_name: str) -> Optional[str]:
        """
        Create a new workspace with all required files and folders.
        
        Args:
            user: Username
            workspace_name: Name of workspace to create
            
        Returns:
            Base path of created workspace, or None if creation fails
            
        Raises:
            ValueError: If workspace name invalid or already exists
            IOError: If workspace files cannot be created (STRICT)
        """
        # Load index
        index_file = "workspace_index.json"
        data = self._load_or_create_index(index_file)

        # Check workspace limit
        user_workspaces = data.get(user, {})
        if len(user_workspaces) >= self.max_workspaces:
            raise ValueError(f"Maximum workspace limit ({self.max_workspaces}) reached.")

        # Check if workspace already exists
        if workspace_name in user_workspaces:
            raise ValueError(f"Workspace '{workspace_name}' already exists.")

        # Generate workspace ID
        workspace_id = str(uuid.uuid4())[:8]

        # Create base path
        base_path = os.path.join(self.workspace_root, user, workspace_name)

        try:
            # Create folder structure
            self._create_folder_structure(base_path)

            # Create metadata.json (STRICT)
            metadata = self._get_metadata_template(workspace_id, workspace_name, user)
            metadata_path = os.path.join(base_path, "metadata.json")
            self._save_workspace_file(metadata_path, metadata, "metadata.json")

            # Create state.json (STRICT)
            state = self._get_state_template()
            state_path = os.path.join(base_path, "state.json")
            self._save_workspace_file(state_path, state, "state.json")

            # Create pipeline.json (STRICT)
            pipeline = self._get_pipeline_template()
            pipeline_path = os.path.join(base_path, "pipeline.json")
            self._save_workspace_file(pipeline_path, pipeline, "pipeline.json")

            # Ensure artifact directories exist (GRACEFUL)
            self._ensure_artifact_dirs(base_path)

            # Update index
            data.setdefault(user, {})
            data[user][workspace_name] = {
                "workspace_id": workspace_id,
                "workspace_path": base_path,
                "status": "created"
            }
            self._save_index(index_file, data)

            return base_path

        except (IOError, OSError) as e:
            # Cleanup on failure
            if os.path.exists(base_path):
                shutil.rmtree(base_path)
            raise e

    # ============================================================================
    # LOAD WORKSPACE
    # ============================================================================

    def load_workspace(self, user: str, workspace_name: str) -> Dict[str, Any]:
        """
        Load all workspace files after relogin.
        
        Args:
            user: Username
            workspace_name: Name of workspace to load
            
        Returns:
            Dictionary with metadata, state, and pipeline
            {
                "workspace_path": str,
                "metadata": dict,
                "state": dict,
                "pipeline": dict
            }
            
        Raises:
            ValueError: If workspace not found in index
            FileNotFoundError: If workspace files missing (STRICT)
            json.JSONDecodeError: If workspace files corrupted (STRICT)
        """
        # Load index
        index_file = "workspace_index.json"
        data = self._load_or_create_index(index_file)

        # Check if workspace exists in index
        user_workspaces = data.get(user, {})
        if workspace_name not in user_workspaces:
            raise ValueError(f"Workspace '{workspace_name}' not found for user '{user}'.")

        workspace_info = user_workspaces[workspace_name]
        base_path = workspace_info["workspace_path"]

        # Check if base path exists
        if not os.path.exists(base_path):
            raise FileNotFoundError(f"Workspace directory not found at {base_path}")

        try:
            # Load metadata.json (STRICT)
            metadata_path = os.path.join(base_path, "metadata.json")
            metadata = self._load_workspace_file(metadata_path, "metadata.json")

            # Load state.json (STRICT)
            state_path = os.path.join(base_path, "state.json")
            state = self._load_workspace_file(state_path, "state.json")

            # Load pipeline.json (STRICT)
            pipeline_path = os.path.join(base_path, "pipeline.json")
            pipeline = self._load_workspace_file(pipeline_path, "pipeline.json")

            # Validate artifact directories (GRACEFUL)
            self._validate_artifact_dirs(base_path)

            return {
                "workspace_path": base_path,
                "metadata": metadata,
                "state": state,
                "pipeline": pipeline
            }

        except (FileNotFoundError, json.JSONDecodeError) as e:
            raise e

    # ============================================================================
    # UPDATE STATE
    # ============================================================================

    def update_state(self, workspace_path: str, key: str, value: Any) -> None:
        pass

    # ============================================================================
    # WORK ON PIPELINE
    # ============================================================================
    def work_on_pipeline(self,workspace_path:str):
        """
        first check if dataset is uplaoded or not
        """
        state_path = os.path.join(workspace_path,"state.json")
        state = self._load_workspace_file(state_path,"state.json")
        if not state.get("dataset_uploaded",False):
            print("Dataset not uploaded. Please upload dataset first.")
            from pipe_line_build.upload import upload_dataset
            upload_dataset(workspace_path)
        else:
            print("Dataset already uploaded. Proceeding to pipeline building.")

        

    # ============================================================================
    # HELPER METHODS
    # ============================================================================

    def _load_or_create_index(self, index_file: str) -> Dict[str, Any]:
        """Load or create workspace index file"""
        if os.path.exists(index_file):
            try:
                with open(index_file, "r") as f:
                    return json.load(f)
            except json.JSONDecodeError:
                return {}
        return {}

    def _save_index(self, index_file: str, data: Dict[str, Any]) -> None:
        """Save workspace index file"""
        try:
            with open(index_file, "w") as f:
                json.dump(data, f, indent=4)
        except IOError as e:
            raise IOError(f"Failed to save workspace index: {str(e)}")

    # ============================================================================
    # UTILITY METHODS
    # ============================================================================

    def list_workspaces(self, user: str) -> Dict[str, Any]:
        """
        Get all workspaces for a user.
        
        Args:
            user: Username
            
        Returns:
            Dictionary of workspaces
        """
        index_file = "workspace_index.json"
        data = self._load_or_create_index(index_file)
        return data.get(user, {})

    def get_workspace_info(self, user: str, workspace_name: str) -> Dict[str, Any]:
        """
        Get metadata for a specific workspace.
        
        Args:
            user: Username
            workspace_name: Name of workspace
            
        Returns:
            Dictionary with workspace info including full loaded data
        """
        try:
            workspace_data = self.load_workspace(user, workspace_name)
            return workspace_data
        except (ValueError, FileNotFoundError, json.JSONDecodeError) as e:
            raise e

    def delete_workspace(self, user: str, workspace_name: str) -> None:
        """
        Delete a workspace completely.
        
        Args:
            user: Username
            workspace_name: Name of workspace to delete
            
        Raises:
            ValueError: If workspace not found
        """
        # Load index
        index_file = "workspace_index.json"
        data = self._load_or_create_index(index_file)

        # Check if workspace exists
        user_workspaces = data.get(user, {})
        if workspace_name not in user_workspaces:
            raise ValueError(f"Workspace '{workspace_name}' not found.")

        # Get workspace path
        workspace_path = user_workspaces[workspace_name]["workspace_path"]

        # Delete folder
        if os.path.exists(workspace_path):
            shutil.rmtree(workspace_path)

        # Remove from index
        del data[user][workspace_name]

        # Save updated index
        self._save_index(index_file, data)

    def rename_workspace(self, user: str, old_name: str, new_name: str) -> None:
        """
        Rename a workspace.
        
        Args:
            user: Username
            old_name: Current workspace name
            new_name: New workspace name
            
        Raises:
            ValueError: If workspace not found or new name already exists
        """
        # Load index
        index_file = "workspace_index.json"
        data = self._load_or_create_index(index_file)

        # Check if workspace exists
        user_workspaces = data.get(user, {})
        if old_name not in user_workspaces:
            raise ValueError(f"Workspace '{old_name}' not found.")

        if new_name in user_workspaces:
            raise ValueError(f"Workspace '{new_name}' already exists.")

        # Get old path
        old_path = user_workspaces[old_name]["workspace_path"]
        new_path = os.path.join(
            self.workspace_root,
            user,
            new_name
        )

        try:
            # Rename folder
            os.rename(old_path, new_path)

            # Update metadata.json
            metadata_file = os.path.join(new_path, "metadata.json")
            metadata = self._load_workspace_file(metadata_file, "metadata.json")
            metadata["workspace_name"] = new_name
            self._save_workspace_file(metadata_file, metadata, "metadata.json")

            # Update index
            data[user][new_name] = data[user].pop(old_name)
            data[user][new_name]["workspace_path"] = new_path

            # Save updated index
            self._save_index(index_file, data)

        except (OSError, IOError, FileNotFoundError, json.JSONDecodeError) as e:
            raise e
