from pymongo import MongoClient
from .config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

agents_collection = db["agents"]
users_collection = db["users"]
installations_collection = db["installations"]
assignments_collection = db["assignments"]
elements_collection = db["elements"]
users_collection = db["users"]
requests_collection = db["requests"]


