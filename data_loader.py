"""
Data loading module for the Organizer Analytics Dashboard.

This module handles loading data from CSV files or PostgreSQL database
with comprehensive error handling and validation.
"""

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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataLoadError(Exception):
    """Custom exception for data loading errors."""
    pass


def validate_dataframe(df: pd.DataFrame, required_columns: list, data_type: str) -> None:
    """
    Validate that a DataFrame contains required columns and is not empty.
    
    Args:
        df: DataFrame to validate
        required_columns: List of required column names
        data_type: Type of data being validated (for error messages)
    
    Raises:
        DataLoadError: If validation fails
    """
    if df.empty:
        raise DataLoadError(f"{ERROR_MESSAGES['empty_data']} {data_type} dataset is empty.")
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise DataLoadError(
            f"{ERROR_MESSAGES['missing_column']} Missing columns in {data_type}: {', '.join(missing_columns)}"
        )


def load_events_from_csv(file_path: str) -> pd.DataFrame:
    """
    Load events data from CSV file.
    
    Args:
        file_path: Path to the events CSV file
    
    Returns:
        DataFrame containing events data
    
    Raises:
        DataLoadError: If file cannot be loaded or is invalid
    """
    try:
        events_df = pd.read_csv(file_path)
        validate_dataframe(events_df, ["event_name", "rsvp_count", "actual_attendance"], "Events")
        
        # Validate data types and values
        if not pd.api.types.is_numeric_dtype(events_df["rsvp_count"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} RSVP count must be numeric.")
        if not pd.api.types.is_numeric_dtype(events_df["actual_attendance"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Actual attendance must be numeric.")
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
    Load feedback data from CSV file.
    
    Args:
        file_path: Path to the feedback CSV file
    
    Returns:
        DataFrame containing feedback data
    
    Raises:
        DataLoadError: If file cannot be loaded or is invalid
    """
    try:
        feedback_df = pd.read_csv(file_path)
        validate_dataframe(feedback_df, ["event_name", "avg_rating", "feedback_count"], "Feedback")
        
        # Validate data types and values
        if not pd.api.types.is_numeric_dtype(feedback_df["avg_rating"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Average rating must be numeric.")
        if not pd.api.types.is_numeric_dtype(feedback_df["feedback_count"]):
            raise DataLoadError(f"{ERROR_MESSAGES['invalid_data']} Feedback count must be numeric.")
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
    Load audience data from CSV file.
    
    Args:
        file_path: Path to the audience CSV file
    
    Returns:
        DataFrame containing audience data
    
    Raises:
        DataLoadError: If file cannot be loaded or is invalid
    """
    try:
        audience_df = pd.read_csv(file_path)
        validate_dataframe(audience_df, ["college", "major", "students"], "Audience")
        
        # Validate data types and values
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
    Create a connection to the PostgreSQL database.
    
    Returns:
        Database connection object
    
    Raises:
        DataLoadError: If connection cannot be established
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
    Load events data from PostgreSQL database.
    
    Args:
        connection: Database connection object
    
    Returns:
        DataFrame containing events data
    
    Raises:
        DataLoadError: If query fails or data is invalid
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
    Load feedback data from PostgreSQL database.
    
    Args:
        connection: Database connection object
    
    Returns:
        DataFrame containing feedback data, or empty DataFrame if table/view doesn't exist
    
    Raises:
        DataLoadError: If query fails (except for missing table/view)
    """
    try:
        feedback_df = pd.read_sql(FEEDBACK_QUERY, connection)
        validate_dataframe(feedback_df, ["event_name", "avg_rating", "feedback_count"], "Feedback")
        logger.info(f"Successfully loaded {len(feedback_df)} feedback records from database.")
        return feedback_df
    except Exception as e:
        error_str = str(e)
        # Check if the error is due to missing table/view
        if "does not exist" in error_str or "relation" in error_str.lower():
            logger.warning(f"Feedback table/view not found in database. Returning empty DataFrame. Error: {error_str}")
            # Return empty DataFrame with expected columns
            empty_df = pd.DataFrame(columns=["event_name", "avg_rating", "feedback_count"])
            logger.info("Returning empty feedback DataFrame (table/view not available).")
            return empty_df
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Error loading feedback: {error_str}")


def load_audience_from_database(connection: psycopg2.extensions.connection) -> pd.DataFrame:
    """
    Load audience data from PostgreSQL database.
    
    Args:
        connection: Database connection object
    
    Returns:
        DataFrame containing audience data, or empty DataFrame if table/view doesn't exist
    
    Raises:
        DataLoadError: If query fails (except for missing table/view)
    """
    try:
        audience_df = pd.read_sql(AUDIENCE_QUERY, connection)
        validate_dataframe(audience_df, ["college", "major", "students"], "Audience")
        logger.info(f"Successfully loaded {len(audience_df)} audience records from database.")
        return audience_df
    except Exception as e:
        error_str = str(e)
        # Check if the error is due to missing table/view
        if "does not exist" in error_str or "relation" in error_str.lower():
            logger.warning(f"Audience table/view not found in database. Returning empty DataFrame. Error: {error_str}")
            # Return empty DataFrame with expected columns
            empty_df = pd.DataFrame(columns=["college", "major", "students"])
            logger.info("Returning empty audience DataFrame (table/view not available).")
            return empty_df
        raise DataLoadError(f"{ERROR_MESSAGES['database_connection']} Error loading audience: {error_str}")


def load_all_data() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Load all data from CSV files or database based on configuration.
    
    Returns:
        Tuple of (events_df, feedback_df, audience_df)
    
    Raises:
        DataLoadError: If any data cannot be loaded
    """
    try:
        if DUMMY_MODE:
            events_df = load_events_from_csv(EVENTS_CSV_PATH)
            feedback_df = load_feedback_from_csv(FEEDBACK_CSV_PATH)
            audience_df = load_audience_from_csv(AUDIENCE_CSV_PATH)
        else:
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

