from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from backend.config import Config

_client = None
_db = None


def get_mongo_db():
    """
    Return a connected pymongo Database handle.
    Uses a module-level lazy singleton so the connection
    is established once and reused across requests.
    """
    global _client, _db

    if _db is None:
        _client = MongoClient(Config.MONGO_URI, serverSelectionTimeoutMS=5000)
        print(Config.MONGO_URI)
        print(Config.MONGO_DB_NAME)
        # Ping to surface connection errors early
        _client.admin.command("ping")
        _db = _client[Config.MONGO_DB_NAME]

    return _db
