import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Test Case Generator"
    VERSION: str = "1.0.0"
    
    # Google Gemini API Key
    GOOGLE_API_KEY: str
    
    # Jira Configuration
    JIRA_URL: str
    JIRA_EMAIL: str
    JIRA_API_TOKEN: str

    class Config:
        env_file = ".env"

settings = Settings()
