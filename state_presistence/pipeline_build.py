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
def work_on_workspace():
    data = load_index()
    user_workspaces = data.get(USER,{})
    workspace_name = input("Enter workspace name to work on: ").strip()
    if workspace_name not in user_workspaces:
        print("\nWorkspace not found.\n")
        return
    workspace_info = user_workspaces[workspace_name]
    while True:
        current_status = workspace_info['status']
        print(f"\nCurrent status: {current_status}")
        if current_status == "data_cleaning":
            pass
        elif current_status == "data"

def menu():
    while True:
        choice = int(input("1.list_workspace\n2.work_on_workspace\n3.exit\n"))

        if choice == 1:
            list_workspaces()
        elif choice == 2:
            work_on_workspace()
        elif choice == 3:
            break
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    menu()