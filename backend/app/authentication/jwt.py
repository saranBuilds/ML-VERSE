from functools import wraps
from flask import request, jsonify, current_app
import jwt

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get("Authorization")
        if not auth or not auth.startswith("Bearer "):
            return jsonify({"message": "Authorization token required"}), 401

        token = auth.split(" ")[1]

        try:
            data = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=[current_app.config["JWT_ALGORITHM"]]
            )
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

        return f(token_data=data, *args, **kwargs)
    return decorated
