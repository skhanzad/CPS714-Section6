# Data loading module
# Handles loading data from either CSV files or PostgreSQL database
# Has validation and error handling built in

import pandas as pd
import psycopg2
from typing import Tuple, Optional
import logging

from config import (
    DUMMY_MODE,
    DATABASE_CONFIG,
    EVENTS_CSV_PATH,
    FEEDBACK_CSV_PATH,
    AUDIENCE_CSV_PATH,
    EVENTS_QUERY,
    FEEDBACK_QUERY,
    AUDIENCE_QUERY,
    ERROR_MESSAGES
)

# ==========================================================
# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ===================================================
# Custom exception
# 
class DataLoadError(Exception):
    """Custom exception for when data loading fails."""
    pass


# ===============================
# Validation helper
def validate_dataframe(df: pd.DataFrame, required_columns: list, data_type: str) -> None:
    """
    Checks that a dataframe has the required columns and isn't empty.
    Raises DataLoadError if validation fails.
    """
    if df.empty:
        raise DataLoadError(f"{ERROR_MESSAGES['empty_data']} {data_type} dataset is empty.")
    
    # Check for missing columns
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise DataLoadError(
            f"{ERROR_MESSAGES['missing_column']} Missing columns in {data_type}: {', '.join(missing_columns)}"
        )


# CSV loading functions
def load_events_from_csv(file_path: str) -> pd.DataFrame:
    """
    Loads events data from a CSV file.
    Validates the data and returns a dataframe.
    """
    try:
        events_df = pd.read_csv(file_path)
        validate_dataframe(events_df, ["event_name", "rsvp_count", "actual_attendance"], "Events")
        
        if not pd.api.types.is_numeric_dtype(events_df["rsvp_count"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} RSVP count must be numeric.")
        if not pd.api.types.is_numeric_dtype(events_df["actual_attendance"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Actual attendance must be numeric.")
        
        # Check for negative values
        if (events_df["rsvp_count"] < 0).any():
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} RSVP count cannot be negative.")
        if (events_df["actual_attendance"] < 0).any():
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Actual attendance cannot be negative.")
        
        if (events_df["actual_attendance"] > events_df["rsvp_count"]).any():
            logger.warning("Some events have actual attendance greater than RSVP count.")
        
        logger.info(f"Successfully loaded {len(events_df)} events from CSV.")
        return events_df
    
    except FileNotFoundError:
        raise DataLoadError(f"{ERROR_MESSAGES['file_not_found']} Events file: {file_path}")
    except pd.errors.EmptyDataError:
        raise DataLoadError(f"{ERROR_MESSAGES['empty_data']} Events file is empty.")
    except Exception as e:
        raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Error loading events: {str(e)}")


def load_feedback_from_csv(file_path: str) -> pd.DataFrame:
    """
    Loads feedback data from CSV.
    Validates ratings are between 1-5 and counts are non-negative.
    """
    try:
        feedback_df = pd.read_csv(file_path)
        validate_dataframe(feedback_df, ["event_name", "avg_rating", "feedback_count"], "Feedback")
        
        if not pd.api.types.is_numeric_dtype(feedback_df["avg_rating"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Average rating must be numeric.")
        if not pd.api.types.is_numeric_dtype(feedback_df["feedback_count"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Feedback count must be numeric.")
        
        # Ratings should be 1-5
        if ((feedback_df["avg_rating"] < 1) | (feedback_df["avg_rating"] > 5)).any():
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Ratings must be between 1 and 5.")
        if (feedback_df["feedback_count"] < 0).any():
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Feedback count cannot be negative.")
        
        logger.info(f"Successfully loaded {len(feedback_df)} feedback records from CSV.")
        return feedback_df
    
    except FileNotFoundError:
        raise DataLoadError(f"{ERROR_MESSAGES['file_not_found']} Feedback file: {file_path}")
    except pd.errors.EmptyDataError:
        raise DataLoadError(f"{ERROR_MESSAGES['empty_data']} Feedback file is empty.")
    except Exception as e:
        raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Error loading feedback: {str(e)}")


def load_audience_from_csv(file_path: str) -> pd.DataFrame:
    """
    Loads audience data from CSV.
    Just checks that student counts are numeric and non-negative.
    """
    try:
        audience_df = pd.read_csv(file_path)
        validate_dataframe(audience_df, ["college", "major", "students"], "Audience")
        
        if not pd.api.types.is_numeric_dtype(audience_df["students"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Student count must be numeric.")
        if (audience_df["students"] < 0).any():
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Student count cannot be negative.")
        
        logger.info(f"Successfully loaded {len(audience_df)} audience records from CSV.")
        return audience_df
    
    except FileNotFoundError:
        raise DataLoadError(f"{ERROR_MESSAGES['file_not_found']} Audience file: {file_path}")
    except pd.errors.EmptyDataError:
        raise DataLoadError(f"{ERROR_MESSAGES['empty_data']} Audience file is empty.")
    except Exception as e:
        raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Error loading audience: {str(e)}")



def get_database_connection() -> psycopg2.extensions.connection:
    """
    Creates a connection to PostgreSQL.
    Returns the connection object or raises DataLoadError.
    """
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        logger.info("Successfully connected to database.")
        return conn
    except psycopg2.OperationalError as e:
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} {str(e)}")
    except Exception as e:
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Unexpected error: {str(e)}")


def load_events_from_database(connection: psycopg2.extensions.connection) -> pd.DataFrame:
    """
    Loads events from the database using the configured query.
    """
    try:
        events_df = pd.read_sql(EVENTS_QUERY, connection)
        validate_dataframe(events_df, ["event_name", "rsvp_count", "actual_attendance"], "Events")
        logger.info(f"Successfully loaded {len(events_df)} events from database.")
        return events_df
    except Exception as e:
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Error loading events: {str(e)}")


def load_feedback_from_database(connection: psycopg2.extensions.connection) -> pd.DataFrame:
    """
    Loads feedback from database.
    Returns empty dataframe if table/view doesn't exist (graceful degradation).
    """
    try:
        feedback_df = pd.read_sql(FEEDBACK_QUERY, connection)
        validate_dataframe(feedback_df, ["event_name", "avg_rating", "feedback_count"], "Feedback")
        logger.info(f"Successfully loaded {len(feedback_df)} feedback records from database.")
        return feedback_df
    except Exception as e:
        error_str = str(e)
        if "does not exist" in error_str or "relation" in error_str.lower():
            logger.warning(f"Feedback table/view not found in database. Returning empty DataFrame. Error: {error_str}")
            empty_df = pd.DataFrame(columns=["event_name", "avg_rating", "feedback_count"])
            logger.info("Returning empty feedback DataFrame (table/view not available).")
            return empty_df
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Error loading feedback: {error_str}")


def load_audience_from_database(connection: psycopg2.extensions.connection) -> pd.DataFrame:
    """
    Loads audience data from database.
    Returns empty dataframe if table/view doesn't exist.
    """
    try:
        audience_df = pd.read_sql(AUDIENCE_QUERY, connection)
        validate_dataframe(audience_df, ["college", "major", "students"], "Audience")
        logger.info(f"Successfully loaded {len(audience_df)} audience records from database.")
        return audience_df
    except Exception as e:
        error_str = str(e)
        # Handle missing table gracefully
        if "does not exist" in error_str or "relation" in error_str.lower():
            logger.warning(f"Audience table/view not found in database. Returning empty DataFrame. Error: {error_str}")
            empty_df = pd.DataFrame(columns=["college", "major", "students"])
            logger.info("Returning empty audience DataFrame (table/view not available).")
            return empty_df
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Error loading audience: {error_str}")


# ====================
# Main loading function
def load_all_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Main function to load all data.
    Uses CSV files if DUMMY_MODE is True, otherwise uses database.
    Returns tuple of (events_df, feedback_df, audience_df).
    """
    try:
        if DUMMY_MODE:
            # Load from CSV files
            events_df = load_events_from_csv(EVENTS_CSV_PATH)
            feedback_df = load_feedback_from_csv(FEEDBACK_CSV_PATH)
            audience_df = load_audience_from_csv(AUDIENCE_CSV_PATH)
        else:
            # Load from database
            connection = get_database_connection()
            try:
                events_df = load_events_from_database(connection)
                feedback_df = load_feedback_from_database(connection)
                audience_df = load_audience_from_database(connection)
            finally:
                connection.close()
                logger.info("Database connection closed.")
        
        return events_df, feedback_df, audience_df
    
    except DataLoadError:
        raise
    except Exception as e:
        raise DataLoadError(f"Unexpected error loading data: {str(e)}")

