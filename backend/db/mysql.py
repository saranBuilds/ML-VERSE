import mysql.connector
from werkzeug.security import generate_password_hash, check_password_hash
from backend.config import Config

def connect_db():
    conn = mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME,
        port=Config.DB_PORT,
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
