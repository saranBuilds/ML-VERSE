import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config import Config

def connect_db():

    conn = mysql.connector.connect(
        host=Config.DB_HOST,
        port=int(Config.DB_PORT),
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        ssl_ca="backend/db/ca.pem",
        use_pure=True
    )
    return conn, conn.cursor(dictionary=True)

def check_user_credentials(username, password):
    conn, cur = connect_db()
    cur.execute("SELECT * FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and check_password_hash(user["password"], password):
        return user
    return None

def get_userdata(username):
    conn, cur = connect_db()
    cur.execute("SELECT id, username, email FROM users WHERE username=%s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()
    return user

def register_user(username, email, password):
    conn, cur = connect_db()
    hashed = generate_password_hash(password)
    cur.execute(
        "INSERT INTO users (username,email,password) VALUES (%s,%s,%s)",
        (username, email, hashed)
    )
    conn.commit()
    cur.close()
    conn.close()
    return True

def check_user_exist(username=None, email=None):
    conn, cur = connect_db()
    status = {"username_exists": False, "email_exists": False}

    if email:
        cur.execute("SELECT id FROM users WHERE email=%s", (email,))
        status["email_exists"] = cur.fetchone() is not None

    if username:
        cur.execute("SELECT id FROM users WHERE username=%s", (username,))
        status["username_exists"] = cur.fetchone() is not None
    cur.close()
    conn.close()
    return status

def update_password(email, new_password):
    conn, cur = connect_db()
    hashed = generate_password_hash(new_password)
    cur.execute(
        "UPDATE users SET password=%s WHERE email=%s",
        (hashed, email)
    )
    conn.commit()
    cur.close()
    conn.close()
    return True


# ------------------------------------------------------------------
# Workspace helpers
# ------------------------------------------------------------------

WORKSPACE_SLOTS = [
    "workspace_id_1",
    "workspace_id_2",
    "workspace_id_3",
    "workspace_id_4",
    "workspace_id_5",
]


def create_user_workspace_row(username):
    """
    Insert a blank user_workspace row for *username* if one does not
    already exist.  Safe to call on every workspace-create request.
    """
    conn, cur = connect_db()
    cur.execute(
        "INSERT IGNORE INTO user_workspace (username) VALUES (%s)",
        (username,)
    )
    conn.commit()
    cur.close()
    conn.close()


def get_workspace_slots(username):
    """
    Return the full user_workspace row for *username*, or None if the
    user has no workspace row yet.
    """
    conn, cur = connect_db()
    cur.execute(
        "SELECT * FROM user_workspace WHERE username = %s",
        (username,)
    )
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def add_workspace_id(username, workspace_id):
    """
    Find the first NULL slot in user_workspace for *username*, write
    *workspace_id* into it, and increment total_workspace.

    Returns True on success, False if all 5 slots are already filled.
    """
    row = get_workspace_slots(username)
    if not row:
        return False

    for slot in WORKSPACE_SLOTS:
        if row[slot] is None:
            conn, cur = connect_db()
            cur.execute(
                f"UPDATE user_workspace "
                f"SET {slot} = %s, total_workspace = total_workspace + 1 "
                f"WHERE username = %s",
                (workspace_id, username)
            )
            conn.commit()
            cur.close()
            conn.close()
            return True

    # All slots occupied
    return False


def get_all_workspace_ids(username):
    """
    Return a list of all non-null workspace IDs belonging to *username*.
    """
    row = get_workspace_slots(username)
    if not row:
        return []
    return [row[slot] for slot in WORKSPACE_SLOTS if row[slot] is not None]


def remove_workspace_id(username, workspace_id):
    """
    Find the slot that holds *workspace_id* for *username*, set it to NULL,
    and decrement total_workspace by 1.

    Returns True on success, False if the workspace_id was not found.
    """
    row = get_workspace_slots(username)
    if not row:
        return False

    for slot in WORKSPACE_SLOTS:
        if row[slot] == workspace_id:
            conn, cur = connect_db()
            cur.execute(
                f"UPDATE user_workspace "
                f"SET {slot} = NULL, total_workspace = GREATEST(total_workspace - 1, 0) "
                f"WHERE username = %s",
                (username,)
            )
            conn.commit()
            cur.close()
            conn.close()
            return True

    return False  # workspace_id not found in any slot
