from workspace_manager import WorkspaceManager

USER = "test02"
WORKSPACE_ROOT = "workspace"
MAX_WORKSPACES = 5

# Initialize WorkspaceManager
manager = WorkspaceManager(workspace_root=WORKSPACE_ROOT, max_workspaces=MAX_WORKSPACES)


# ============================================================================
# CLI OPERATIONS
# ============================================================================

def create_workspace():
    """Create a new workspace with state persistence"""
    try:
        workspace_name = input("Workspace Name: ").strip()

        if not workspace_name:
            print("\n❌ Workspace name cannot be empty.\n")
            return

        workspace_path = manager.create_workspace(USER, workspace_name)

        print("\n✅ Workspace created successfully.")
        print(f"   Name : {workspace_name}")
        print(f"   Path : {workspace_path}\n")

    except ValueError as e:
        print(f"\n❌ Error: {str(e)}\n")
    except IOError as e:
        print(f"\n❌ Failed to create workspace: {str(e)}\n")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}\n")


def list_workspaces():
    """List all workspaces for the current user"""
    try:
        user_workspaces = manager.list_workspaces(USER)

        if not user_workspaces:
            print("\n📭 No workspaces found.\n")
            return

        print("\n" + "=" * 60)
        print("📂 WORKSPACES")
        print("=" * 60)

        for idx, (name, info) in enumerate(user_workspaces.items(), 1):
            print(f"\n{idx}. {name}")
            print(f"   ID     : {info['workspace_id']}")
            print(f"   Status : {info['status']}")
            print(f"   Path   : {info['workspace_path']}")

        print("\n" + "=" * 60 + "\n")

    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")


def load_workspace():
    """Load a workspace and display its state and pipeline"""
    try:
        workspace_name = input("Workspace to load: ").strip()

        if not workspace_name:
            print("\n❌ Workspace name cannot be empty.\n")
            return

        workspace_data = manager.load_workspace(USER, workspace_name)

        metadata = workspace_data["metadata"]
        state = workspace_data["state"]
        pipeline = workspace_data["pipeline"]

        print("\n" + "=" * 60)
        print("📦 WORKSPACE LOADED")
        print("=" * 60)

        print("\n🔹 METADATA")
        print(f"   Workspace ID   : {metadata['workspace_id']}")
        print(f"   Workspace Name : {metadata['workspace_name']}")
        print(f"   Owner          : {metadata['owner']}")
        print(f"   Created At     : {metadata['created_at']}")

        print("\n🔹 STATE")
        print(f"   Current Step    : {state['current_step']}")
        print(f"   Dataset Uploaded: {state['dataset_uploaded']}")
        print(f"   Pipeline Built  : {state['pipeline_built']}")
        print(f"   Dataset Status  : {state['dataset_status']}")
        print(f"   Model Status    : {state['model_status']}")
        print(f"   Results Status  : {state['results_status']}")

        print("\n🔹 PIPELINE CONFIGURATION")
        print(f"   Remove Columns  : {pipeline['remove_columns']}")
        print(f"   Missing Values  : {pipeline['missing_values']}")
        print(f"   Encoding        : {pipeline['encoding']}")
        print(f"   Scaling         : {pipeline['scaling']}")
        print(f"   Target Column   : {pipeline['target_column']}")

        print("\n" + "=" * 60 + "\n")

    except ValueError as e:
        print(f"\n❌ Error: {str(e)}\n")
    except FileNotFoundError as e:
        print(f"\n❌ Workspace files not found: {str(e)}\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")


def rename_workspace():
    """Rename an existing workspace"""
    try:
        old_name = input("Workspace to rename: ").strip()

        if not old_name:
            print("\n❌ Workspace name cannot be empty.\n")
            return

        new_name = input("New workspace name: ").strip()

        if not new_name:
            print("\n❌ New workspace name cannot be empty.\n")
            return

        manager.rename_workspace(USER, old_name, new_name)

        print(f"\n✅ Workspace renamed successfully.")
        print(f"   From: {old_name}")
        print(f"   To  : {new_name}\n")

    except ValueError as e:
        print(f"\n❌ Error: {str(e)}\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")


def delete_workspace():
    """Delete a workspace"""
    try:
        workspace_name = input("Workspace to delete: ").strip()

        if not workspace_name:
            print("\n❌ Workspace name cannot be empty.\n")
            return

        # Confirmation
        confirm = input(f"Are you sure you want to delete '{workspace_name}'? (yes/no): ").strip().lower()

        if confirm != "yes":
            print("\n⏭️  Deletion cancelled.\n")
            return

        manager.delete_workspace(USER, workspace_name)

        print(f"\n✅ Workspace '{workspace_name}' deleted successfully.\n")

    except ValueError as e:
        print(f"\n❌ Error: {str(e)}\n")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}\n")


def update_state():
    pass


def update_pipeline():
    pass


# ============================================================================
# MENU
# ============================================================================

def menu():
    """Main menu loop"""
    print(f"\n🚀 ML VERSE - User: {USER}")
    print(f"   Workspace Root: {WORKSPACE_ROOT}")
    print(f"   Max Workspaces: {MAX_WORKSPACES}\n")

    while True:
        print("=" * 60)
        print("📋 MENU")
        print("=" * 60)
        print("1. ✨ Create Workspace")
        print("2. 📂 List Workspaces")
        print("3. 📦 Load Workspace (View Details)")
        print("4. ✏️  Rename Workspace")
        print("5. 🔄 Update State")
        print("6. ⚙️  Update Pipeline")
        print("7. 🗑️  Delete Workspace")
        print("8. 🚪 Exit")
        print("=" * 60)

        try:
            choice = input("\nChoice: ").strip()

            if choice == "1":
                create_workspace()

            elif choice == "2":
                list_workspaces()

            elif choice == "3":
                load_workspace()

            elif choice == "4":
                rename_workspace()

            elif choice == "5":
                update_state()

            elif choice == "6":
                update_pipeline()

            elif choice == "7":
                delete_workspace()

            elif choice == "8":
                print("\n👋 Goodbye!\n")
                break

            else:
                print("\n❌ Invalid choice. Please try again.\n")

        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!\n")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}\n")


if __name__ == "__main__":
    menu()
