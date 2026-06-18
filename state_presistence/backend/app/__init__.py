from flask import Flask
from flask_cors import CORS
from backend.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.secret_key = Config.SECRET_KEY

    CORS(
        app,
        origins=Config.FRONTEND_URLS,
        supports_credentials= True 
    )
    from backend.app.Main.home import home_bp
    app.register_blueprint(home_bp,url_prefix='/')

    return app