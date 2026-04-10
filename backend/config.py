import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', '72759cd8f4b592a9a61af51b4f43f48937629779745bdede')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', '72759cd8f4b592a9a61af51b4f43f48937629779745bdede')
    MONGO_URI = os.getenv('MONGO_URI', '')
    JWT_ACCESS_TOKEN_EXPIRES = False
