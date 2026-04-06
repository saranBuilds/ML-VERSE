from flask import Blueprint, request, jsonify, session, current_app
from datetime import datetime, timezone, timedelta
import jwt

from backend.db.mysql import (
    check_user_credentials,
    register_user,
    check_user_exist,   
    update_password,
    get_userdata,
    
)
from .jwt import token_required
from .otp import send_otp

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = check_user_credentials(data["username"], data["password"])
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "user": user["username"],
            "exp": datetime.now(timezone.utc) +
            timedelta(minutes=current_app.config["JWT_EXP_MINUTES"])
        },
        current_app.config["SECRET_KEY"],
        algorithm=current_app.config["JWT_ALGORITHM"]
    )
    return jsonify({"access_token": token})

@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    status = check_user_exist(data["username"], data["email"])
    if status["email_exists"] or status["username_exists"]:
        return jsonify({"message": "User already exists"}), 409

    otp = send_otp(data["email"], data["username"])
    session["signup"] = {
        "otp": str(otp),
        "user": data,
        "time": datetime.now(timezone.utc).isoformat()
    }
    return jsonify({"message": "OTP sent"})

@auth_bp.route("/signup/verify", methods=["POST"])
def signup_verify():
    data = request.get_json()
    s = session.get("signup")

    if not s:
        return jsonify({"message": "Session expired"}), 409
    if not data:
        return jsonify({"message": "No data received"}), 400
    otp = data.get("otp")
    if not otp:
        return jsonify({"message": "OTP is required"}), 400

    created = datetime.fromisoformat(s["time"])
    if datetime.now(timezone.utc) - created > timedelta(
        seconds=current_app.config["OTP_EXPIRY_SECONDS"]
    ):
        session.clear()
        return jsonify({"message": "OTP expired"}), 409

    print("otp :", otp, s["otp"])

    if otp != s["otp"]:
        return jsonify({"message": f"Invalid OTP"}), 401

    register_user(
        s["user"]["username"],
        s["user"]["email"],
        s["user"]["password"]
    )

    session.clear()
    return jsonify({"message": "User registered"})

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json()

    if not data or "email" not in data:
        return jsonify({"message": "Email is required"}), 400

    email = data.get("email")

    if not check_user_exist(email=email)["email_exists"]:
        return jsonify({"message": "Email not registered"}), 404

    otp = send_otp(email)

    session["fp"] = {
        "email": email,
        "otp": str(otp),
        "time": datetime.now(timezone.utc).isoformat()
    }

    return jsonify({"message": "OTP sent"}), 200

@auth_bp.route("/forgot-password/reset", methods=["POST"])
def reset_password():
    data = request.get_json()
    server_otp = session.get("fp")

    if not data:
        return jsonify({"message": "No data received"}), 400

    user_otp = data.get("otp")
    new_password = data.get("new_password")

    if not user_otp or not new_password:
        return jsonify({"message": "OTP and new password required"}), 400

    if not server_otp:
        return jsonify({"message": "Session expired"}), 409

    created = datetime.fromisoformat(server_otp["time"])
    if datetime.now(timezone.utc) - created > timedelta(
        seconds=current_app.config["OTP_EXPIRY_SECONDS"]
    ):
        session.pop("fp", None)
        return jsonify({"message": "OTP expired"}), 409

    if str(user_otp) != str(server_otp["otp"]):
        return jsonify({"message": "Invalid OTP"}), 401

    update_password(server_otp["email"], new_password)

    session.pop("fp", None)

    return jsonify({"message": "Password updated"}), 200

@auth_bp.route("/get-user-data",methods=["POST"])
def get():
    data = request.get_json()
    user = data.get("user")

    user_data = get_userdata(user)
    if user_data:
        return jsonify(user_data),200
    else:
        return jsonify({"message":"user not found"}),400

@auth_bp.route("change-pwd",methods = ["POST"])
def change():
    data = request.get_json()
    username  = data.get("username")
    current_passowrd = data.get("currentPassword")
    new_password = data.get("newPassword")
    email = data.get("email")
    print(data)
    print("i/p",username,current_passowrd,new_password,email)
    if check_user_credentials(username,current_passowrd):
        print("true")
        update_password(email,new_password)
        return jsonify({"message":"password changed successfully"}),200
    
    else:
        print("false")
        return jsonify({"message":"password didt match"}),400


@auth_bp.route("/protected", methods=["GET"])
@token_required
def protected(token_data):
    return jsonify({"message": "Access granted", "user": token_data["user"]})
