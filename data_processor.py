# Data processing module
# Handles all the calculations and data transformations
# Things like attendance rates, summary stats, comment parsing, etc.

import pandas as pd
from typing import Dict, List, Tuple
import logging

from config import ERROR_MESSAGES

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom exception
class DataProcessingError(Exception):
    """Exception for when data processing fails."""
    pass


# Attendance rate calculation
def calculate_attendance_rate(events_df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculates attendance rate (actual / rsvp * 100) for each event.
    Returns a new dataframe with the attendance_rate column added.
    """
    try:
        if events_df.empty:
            raise DataProcessingError(f"{ERROR_MESSAGES['empty_data']} Cannot calculate rates for empty dataset.")
        
        result_df = events_df.copy()
        
        result_df["attendance_rate"] = (
            result_df["actual_attendance"] / result_df["rsvp_count"].replace(0, pd.NA)
        ) * 100
        
        result_df["attendance_rate"] = result_df["attendance_rate"].round(1)
        
        result_df["attendance_rate"] = result_df["attendance_rate"].fillna(0)
        
        logger.info("Successfully calculated attendance rates.")
        return result_df
    
    except Exception as e:
        raise DataProcessingError(f"{ERROR_MESSAGES['calculation_error']} Attendance rate: {str(e)}")


# Summary statistics
def calculate_summary_statistics(
    events_df: pd.DataFrame,
    feedback_df: pd.DataFrame,
    audience_df: pd.DataFrame
) -> Dict[str, float]:
    """
    Calculates all the summary stats shown in the dashboard cards.
    Returns a dict with totals, averages, etc.
    """
    try:
        # Event stats
        total_rsvp = events_df["rsvp_count"].sum() if not events_df.empty else 0
        total_attendance = events_df["actual_attendance"].sum() if not events_df.empty else 0
        
        if total_rsvp > 0:
            overall_attendance_rate = (total_attendance / total_rsvp) * 100
        else:
            overall_attendance_rate = 0.0
            logger.warning("Total RSVP count is 0, setting attendance rate to 0.")
        
        # Feedback stats
        avg_rating = feedback_df["avg_rating"].mean() if not feedback_df.empty else 0.0
        total_feedback = feedback_df["feedback_count"].sum() if not feedback_df.empty else 0
        
        # Audience stats
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


# Comment parsing
def parse_event_comments(feedback_df: pd.DataFrame) -> Dict[str, List[str]]:
    """
    Parses comments from feedback data and groups them by event.
    Comments are separated by semicolons in the data.
    Returns a dict mapping event names to lists of comment strings.
    """
    try:
        comments_by_event = {}
        
        if feedback_df.empty:
            logger.warning("Feedback DataFrame is empty, returning empty comments dictionary.")
            return comments_by_event
        
        # Make sure comments column exists
        if "comments" not in feedback_df.columns:
            logger.warning("Comments column not found in feedback data.")
            return comments_by_event
        
        # Go through each row and extract comments
        for _, row in feedback_df.iterrows():
            event_name = row.get("event_name", "Unknown")
            comments_text = str(row.get("comments", "")).strip()
            
            # Skip empty comments
            if not comments_text or comments_text == "nan":
                continue
            
            # Split by semicolon and clean up whitespace
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
    Gets the comments for a specific event.
    Returns empty list if event not found.
    """
    return comments_by_event.get(event_name, [])


# Audience data preparation
# ==============================================
def prepare_audience_by_college(audience_df: pd.DataFrame) -> pd.DataFrame:
    """
    Groups audience data by college and sums up student counts.
    Used for the pie chart.
    """
    try:
        if audience_df.empty:
            logger.warning("Audience DataFrame is empty, returning empty college summary.")
            return pd.DataFrame(columns=["college", "students"])
        
        # Group by college and sum students
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
    Prepares audience data for the major bar chart.
    Sorts by student count (ascending) so smallest bars are at top.
    """
    try:
        if audience_df.empty:
            logger.warning("Audience DataFrame is empty, returning empty major summary.")
            return pd.DataFrame(columns=["college", "major", "students"])
        
        # Sort ascending for the horizontal bar chart
        sorted_df = audience_df.sort_values("students", ascending=True).copy()
        
        logger.info(f"Successfully prepared audience data for {len(sorted_df)} majors.")
        return sorted_df
    
    except Exception as e:
        raise DataProcessingError(f"Error preparing audience by major: {str(e)}")





# =========================================================
# Utility function
def calculate_percentage(value: float, total: float) -> float:
    """
    Simple percentage calculator.
    Returns 0 if total is 0 to avoid division by zero.
    """
    if total == 0:
        return 0.0
    return round((value / total) * 100, 1)

