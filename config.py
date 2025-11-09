"""
Configuration module for the Organizer Analytics Dashboard.

This module contains all configuration settings, constants, and environment
variables used throughout the application.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Application Configuration
APP_TITLE = "Organizer Analytics Dashboard"
APP_DESCRIPTION = "Comprehensive event analytics and audience insights"
DEFAULT_PORT = 8050
DEFAULT_HOST = "127.0.0.1"
DEBUG_MODE = True

# Data Source Configuration
DUMMY_MODE = True  # Set to False to use PostgreSQL database

# File Paths
DATA_DIRECTORY = "data"
EVENTS_CSV_PATH = os.path.join(DATA_DIRECTORY, "events.csv")
FEEDBACK_CSV_PATH = os.path.join(DATA_DIRECTORY, "feedback.csv")
AUDIENCE_CSV_PATH = os.path.join(DATA_DIRECTORY, "audience.csv")

# Database Configuration (used when DUMMY_MODE is False)
DATABASE_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "database": os.getenv("POSTGRES_DB", "analytics_db"),
    "user": os.getenv("POSTGRES_USER", "postgres"),
    "password": os.getenv("POSTGRES_PASSWORD", ""),
    "port": os.getenv("POSTGRES_PORT", "5432")
}

# Database Queries
EVENTS_QUERY = "SELECT * FROM events;"
FEEDBACK_QUERY = "SELECT * FROM feedback;"
AUDIENCE_QUERY = "SELECT * FROM audience;"

# UI Configuration
COLORS = {
    "primary": "#3498db",
    "success": "#2ecc71",
    "warning": "#f39c12",
    "danger": "#e74c3c",
    "info": "#9b59b6",
    "dark": "#2c3e50",
    "light": "#ecf0f1",
    "muted": "#7f8c8d",
    "background": "#f5f6fa",
    "white": "#ffffff"
}

# Chart Configuration
CHART_HEIGHT_PERFORMANCE = 500
CHART_HEIGHT_STANDARD = 400
CHART_HEIGHT_MAJOR = 500
CHART_FONT_FAMILY = "Segoe UI, sans-serif"
CHART_FONT_SIZE = 12

# Error Messages
ERROR_MESSAGES = {
    "file_not_found": "Error: Data file not found. Please ensure CSV files exist in the data directory.",
    "database_connection": "Error: Unable to connect to database. Please check your database configuration.",
    "invalid_data": "Error: Invalid data format. Please check your data files.",
    "empty_data": "Error: No data available. Please ensure data files contain valid records.",
    "calculation_error": "Error: Unable to calculate metrics. Please check your data values.",
    "missing_column": "Error: Required column missing in data. Please check your data structure."
}

