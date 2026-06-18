import os
import json
import uuid
import shutil
from datetime import datetime

USER = "test02"
WORKSPACE_ROOT = "workspace"
INDEX_FILE = "workspace_index.json"
MAX_WORKSPACES = 5


def load_index():
    if os.path.exists(INDEX_FILE):
        try:
            with open(INDEX_FILE, "r") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return {}
    return {}


def save_index(data):
    with open(INDEX_FILE, "w") as f:
        json.dump(data, f, indent=4)


def create_workspace():

    data = load_index()

    user_workspaces = data.get(USER, {})

    if len(user_workspaces) >= MAX_WORKSPACES:
        print(f"\nMaximum workspace limit ({MAX_WORKSPACES}) reached.\n")
        return

    workspace_name = input("Workspace Name: ").strip()

    if workspace_name in user_workspaces:
        print("\nWorkspace already exists.\n")
        return

    workspace_id = str(uuid.uuid4())[:8]

    base_path = os.path.join(
        WORKSPACE_ROOT,
        USER,
        workspace_name
    )

    folders = [
        "data",
        "models",
        "results",
        "reports",
        "logs",
        "preprocessing"
    ]

    for folder in folders:
        os.makedirs(
            os.path.join(base_path, folder),
            exist_ok=True
        )

    metadata = {
        "workspace_id": workspace_id,
        "workspace_name": workspace_name,
        "user": USER,
        "status": "created",
        "dataset_uploaded": False,
        "model_trained": False,
        "created_at": datetime.now().isoformat()
    }

    metadata_path = os.path.join(
        base_path,
        "metadata.json"
    )

    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)

    data.setdefault(USER, {})

    data[USER][workspace_name] = {
        "workspace_id": workspace_id,
        "workspace_path": base_path,
        "status": "created"
    }

    save_index(data)

    print("\nWorkspace created successfully.")
    print(f"ID   : {workspace_id}")
    print(f"Path : {base_path}\n")


def list_workspaces():

    data = load_index()

    user_workspaces = data.get(USER, {})

    if not user_workspaces:
        print("\nNo workspaces found.\n")
        return

    print("\n------ WORKSPACES ------")

    for name, info in user_workspaces.items():
        print(f"\nName : {name}")
        print(f"ID   : {info['workspace_id']}")
        print(f"Path : {info['workspace_path']}")
        print(f"Status : {info['status']}")

    print("\n------------------------\n")


def rename_workspace():

    data = load_index()

    user_workspaces = data.get(USER, {})

    old_name = input(
        "Workspace to rename: "
    ).strip()

    if old_name not in user_workspaces:
        print("\nWorkspace not found.\n")
        return

    new_name = input(
        "New workspace name: "
    ).strip()

    old_path = os.path.join(
        WORKSPACE_ROOT,
        USER,
        old_name
    )

    new_path = os.path.join(
        WORKSPACE_ROOT,
        USER,
        new_name
    )

    os.rename(old_path, new_path)

    metadata_file = os.path.join(
        new_path,
        "metadata.json"
    )

    with open(metadata_file, "r") as f:
        metadata = json.load(f)

    metadata["workspace_name"] = new_name

    with open(metadata_file, "w") as f:
        json.dump(metadata, f, indent=4)

    data[USER][new_name] = data[USER].pop(old_name)

    data[USER][new_name]["workspace_path"] = new_path

    save_index(data)

    print("\nWorkspace renamed successfully.\n")


def delete_workspace():

    data = load_index()

    user_workspaces = data.get(USER, {})

    workspace_name = input(
        "Workspace to delete: "
    ).strip()

    if workspace_name not in user_workspaces:
        print("\nWorkspace not found.\n")
        return

    folder_path = os.path.join(
        WORKSPACE_ROOT,
        USER,
        workspace_name
    )

    shutil.rmtree(folder_path)

    del data[USER][workspace_name]

    save_index(data)

    print("\nWorkspace deleted successfully.\n")


def menu():

    while True:

        print("===== ML VERSE =====")
        print("1. Create Workspace")
        print("2. List Workspaces")
        print("3. Rename Workspace")
        print("4. Delete Workspace")
        print("5. Exit")

        try:
            choice = int(input("\nChoice: "))
        except ValueError:
            print("\nInvalid input.\n")
            continue

        if choice == 1:
            create_workspace()

        elif choice == 2:
            list_workspaces()

        elif choice == 3:
            rename_workspace()

        elif choice == 4:
            delete_workspace()

        elif choice == 5:
            print("\nGoodbye.")
            break

        else:
            print("\nInvalid choice.\n")


if __name__ == "__main__":
    menu()