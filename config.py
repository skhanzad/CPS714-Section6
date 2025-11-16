#### Configuration file - all the settings and constants
###### Central place for all config values - makes it easy to change things
########## without digging through the code






import os
from dotenv import load_dotenv

# Load .env file if it exists
load_dotenv()



APP_TITLE = "Organizer Analytics Dashboard"
APP_DESCRIPTION = "Comprehensive event analytics and audience insights"
DEFAULT_PORT = 8050
DEFAULT_HOST = "0.0.0.0"  
DEBUG_MODE = True




DUMMY_MODE = True  # False = use PostgreSQL, True = use CSV files



# File paths (for CSV mode)
DATA_DIRECTORY = "data"
EVENTS_CSV_PATH = os.path.join(DATA_DIRECTORY, "events.csv")
FEEDBACK_CSV_PATH = os.path.join(DATA_DIRECTORY, "feedback.csv")
AUDIENCE_CSV_PATH = os.path.join(DATA_DIRECTORY, "audience.csv")



# Database config (PostgreSQL)
DATABASE_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "localhost"),
    "database": os.getenv("POSTGRES_DB", "campus_connect_db"),
    "user": os.getenv("POSTGRES_USER", "root"),
    "password": os.getenv("POSTGRES_PASSWORD", "admin"),
    "port": os.getenv("POSTGRES_PORT", "5432")
}



#########################
#########################
#########################

# SQL queries
EVENTS_QUERY = "SELECT * FROM event_summary;"
FEEDBACK_QUERY = "SELECT * FROM feedback;"
AUDIENCE_QUERY = "SELECT * FROM audience;"



#########################
#########################

# UI color scheme
COLORS = {
    "primary": "#3498db",    # Blue
    "success": "#2ecc71",    # Green
    "warning": "#f39c12",    # Orange
    "danger": "#e74c3c",     # Red
    "info": "#9b59b6",       # Purple
    "dark": "#2c3e50",       # Dark gray
    "light": "#ecf0f1",      # Light gray
    "muted": "#7f8c8d",      # Medium gray
    "background": "#f5f6fa", # Background color
    "white": "#ffffff"       # White
}


###########################################################################

# Chart settings
CHART_HEIGHT_PERFORMANCE = 500
CHART_HEIGHT_STANDARD = 400
CHART_HEIGHT_MAJOR = 500
CHART_FONT_FAMILY = "Segoe UI, sans-serif"
CHART_FONT_SIZE = 12

# Error messages
ERROR_MESSAGES = {
    "file_not_found": "Error: Data file not found. Please ensure CSV files exist in the data directory.",
    "database_connection": "Error: Unable to connect to database. Please check your database configuration.",
    "invalid_data": "Error: Invalid data format. Please check your data files.",
    "empty_data": "Error: No data available. Please ensure data files contain valid records.",
    "calculation_error": "Error: Unable to calculate metrics. Please check your data values.",
    "missing_column": "Error: Required column missing in data. Please check your data structure."
}

