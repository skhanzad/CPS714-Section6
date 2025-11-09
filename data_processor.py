"""
Data processing module for the Organizer Analytics Dashboard.

This module handles data processing, calculations, and transformations
with comprehensive error handling.
"""

import pandas as pd
from typing import Dict, List, Tuple
import logging

from config import ERROR_MESSAGES

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DataProcessingError(Exception):
    """Custom exception for data processing errors."""
    pass


def calculate_attendance_rate(events_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate attendance rate for each event.
    
    Args:
        events_df: DataFrame containing event data with rsvp_count and actual_attendance
    
    Returns:
        DataFrame with added attendance_rate column
    
    Raises:
        DataProcessingError: If calculation fails
    """
    try:
        if events_df.empty:
            raise DataProcessingError(f"{ERROR_MESSAGES['empty_data']} Cannot calculate rates for empty dataset.")
        
        # Create a copy to avoid modifying original
        result_df = events_df.copy()
        
        # Calculate attendance rate, handling division by zero
        result_df["attendance_rate"] = (
            result_df["actual_attendance"] / result_df["rsvp_count"].replace(0, pd.NA)
        ) * 100
        
        # Round to 1 decimal place
        result_df["attendance_rate"] = result_df["attendance_rate"].round(1)
        
        # Fill NaN values (from division by zero) with 0
        result_df["attendance_rate"] = result_df["attendance_rate"].fillna(0)
        
        logger.info("Successfully calculated attendance rates.")
        return result_df
    
    except Exception as e:
        raise DataProcessingError(f"{ERROR_MESSAGES['calculation_error']} Attendance rate: {str(e)}")


def calculate_summary_statistics(
    events_df: pd.DataFrame,
    feedback_df: pd.DataFrame,
    audience_df: pd.DataFrame
) -> Dict[str, float]:
    """
    Calculate summary statistics for the dashboard.
    
    Args:
        events_df: DataFrame containing event data
        feedback_df: DataFrame containing feedback data
        audience_df: DataFrame containing audience data
    
    Returns:
        Dictionary containing summary statistics
    
    Raises:
        DataProcessingError: If calculation fails
    """
    try:
        # Calculate event statistics
        total_rsvp = events_df["rsvp_count"].sum() if not events_df.empty else 0
        total_attendance = events_df["actual_attendance"].sum() if not events_df.empty else 0
        
        # Calculate overall attendance rate
        if total_rsvp > 0:
            overall_attendance_rate = (total_attendance / total_rsvp) * 100
        else:
            overall_attendance_rate = 0.0
            logger.warning("Total RSVP count is 0, setting attendance rate to 0.")
        
        # Calculate feedback statistics
        avg_rating = feedback_df["avg_rating"].mean() if not feedback_df.empty else 0.0
        total_feedback = feedback_df["feedback_count"].sum() if not feedback_df.empty else 0
        
        # Calculate audience statistics
        total_students = audience_df["students"].sum() if not audience_df.empty else 0
        
        statistics = {
            "total_rsvp": total_rsvp,
            "total_attendance": total_attendance,
            "overall_attendance_rate": round(overall_attendance_rate, 1),
            "avg_rating": round(avg_rating, 1),
            "total_feedback": total_feedback,
            "total_students": total_students
        }
        
        logger.info("Successfully calculated summary statistics.")
        return statistics
    
    except Exception as e:
        raise DataProcessingError(f"{ERROR_MESSAGES['calculation_error']} Summary statistics: {str(e)}")


def parse_event_comments(feedback_df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Parse and organize comments by event name.
    
    Args:
        feedback_df: DataFrame containing feedback data with 'comments' column
    
    Returns:
        Dictionary mapping event names to lists of comments
    
    Raises:
        DataProcessingError: If parsing fails
    """
    try:
        comments_by_event = {}
        
        if feedback_df.empty:
            logger.warning("Feedback DataFrame is empty, returning empty comments dictionary.")
            return comments_by_event
        
        # Check if comments column exists
        if "comments" not in feedback_df.columns:
            logger.warning("Comments column not found in feedback data.")
            return comments_by_event
        
        for _, row in feedback_df.iterrows():
            event_name = row.get("event_name", "Unknown")
            comments_text = str(row.get("comments", "")).strip()
            
            if not comments_text or comments_text == "nan":
                continue
            
            # Split comments by semicolon and clean them
            event_comments = [
                comment.strip()
                for comment in comments_text.split(";")
                if comment.strip()
            ]
            
            if event_comments:
                comments_by_event[event_name] = event_comments
        
        logger.info(f"Successfully parsed comments for {len(comments_by_event)} events.")
        return comments_by_event
    
    except Exception as e:
        raise DataProcessingError(f"Error parsing comments: {str(e)}")


def get_comments_for_event(
    comments_by_event: Dict[str, List[str]],
    event_name: str
) -> List[str]:
    """
    Get comments for a specific event.
    
    Args:
        comments_by_event: Dictionary mapping event names to comments
        event_name: Name of the event to get comments for
    
    Returns:
        List of comments for the specified event, or empty list if not found
    """
    return comments_by_event.get(event_name, [])


def prepare_audience_by_college(audience_df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare audience data grouped by college.
    
    Args:
        audience_df: DataFrame containing audience data
    
    Returns:
        DataFrame with college and total students
    
    Raises:
        DataProcessingError: If processing fails
    """
    try:
        if audience_df.empty:
            raise DataProcessingError(f"{ERROR_MESSAGES['empty_data']} Cannot process empty audience data.")
        
        college_summary = (
            audience_df.groupby("college")["students"]
            .sum()
            .reset_index()
        )
        
        logger.info(f"Successfully prepared audience data for {len(college_summary)} colleges.")
        return college_summary
    
    except Exception as e:
        raise DataProcessingError(f"Error preparing audience by college: {str(e)}")


def prepare_audience_by_major(audience_df: pd.DataFrame) -> pd.DataFrame:
    """
    Prepare audience data sorted by major with college information.
    
    Args:
        audience_df: DataFrame containing audience data
    
    Returns:
        DataFrame sorted by students (ascending)
    
    Raises:
        DataProcessingError: If processing fails
    """
    try:
        if audience_df.empty:
            raise DataProcessingError(f"{ERROR_MESSAGES['empty_data']} Cannot process empty audience data.")
        
        # Sort by students in ascending order for better chart display
        sorted_df = audience_df.sort_values("students", ascending=True).copy()
        
        logger.info(f"Successfully prepared audience data for {len(sorted_df)} majors.")
        return sorted_df
    
    except Exception as e:
        raise DataProcessingError(f"Error preparing audience by major: {str(e)}")


def calculate_percentage(value: float, total: float) -> float:
    """
    Calculate percentage value.
    
    Args:
        value: The value to calculate percentage for
        total: The total value
    
    Returns:
        Percentage as a float (0-100)
    """
    if total == 0:
        return 0.0
    return round((value / total) * 100, 1)

