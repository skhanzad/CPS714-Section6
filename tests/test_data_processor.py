"""
Unit tests for the data_processor module.
"""

import unittest
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_processor import (
    calculate_attendance_rate,
    calculate_summary_statistics,
    parse_event_comments,
    get_comments_for_event,
    prepare_audience_by_college,
    prepare_audience_by_major,
    calculate_percentage,
    DataProcessingError
)


class TestDataProcessor(unittest.TestCase):
    """Test cases for data processing functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.events_data = pd.DataFrame({
            "event_name": ["Event 1", "Event 2", "Event 3"],
            "rsvp_count": [100, 200, 150],
            "actual_attendance": [80, 150, 120]
        })
        
        self.feedback_data = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "avg_rating": [4.5, 4.8],
            "feedback_count": [20, 30],
            "comments": ["Great event;Excellent;Good", "Amazing;Wonderful"]
        })
        
        self.audience_data = pd.DataFrame({
            "college": ["Engineering", "Engineering", "Business"],
            "major": ["CS", "EE", "Finance"],
            "students": [100, 50, 75]
        })
    
    def test_calculate_attendance_rate_success(self):
        """Test successful attendance rate calculation."""
        result_df = calculate_attendance_rate(self.events_data)
        
        self.assertIn("attendance_rate", result_df.columns)
        self.assertEqual(result_df.loc[0, "attendance_rate"], 80.0)
        self.assertEqual(result_df.loc[1, "attendance_rate"], 75.0)
    
    def test_calculate_attendance_rate_zero_rsvp(self):
        """Test attendance rate calculation with zero RSVP."""
        data = pd.DataFrame({
            "event_name": ["Event 1"],
            "rsvp_count": [0],
            "actual_attendance": [0]
        })
        
        result_df = calculate_attendance_rate(data)
        self.assertEqual(result_df.loc[0, "attendance_rate"], 0.0)
    
    def test_calculate_summary_statistics_success(self):
        """Test successful summary statistics calculation."""
        stats = calculate_summary_statistics(
            self.events_data,
            self.feedback_data,
            self.audience_data
        )
        
        self.assertEqual(stats["total_rsvp"], 450)
        self.assertEqual(stats["total_attendance"], 350)
        self.assertAlmostEqual(stats["overall_attendance_rate"], 77.8, places=1)
        self.assertAlmostEqual(stats["avg_rating"], 4.65, places=2)
        self.assertEqual(stats["total_students"], 225)
    
    def test_parse_event_comments_success(self):
        """Test successful parsing of event comments."""
        comments_dict = parse_event_comments(self.feedback_data)
        
        self.assertIn("Event 1", comments_dict)
        self.assertIn("Event 2", comments_dict)
        self.assertEqual(len(comments_dict["Event 1"]), 3)
        self.assertEqual(len(comments_dict["Event 2"]), 2)
    
    def test_get_comments_for_event_success(self):
        """Test getting comments for a specific event."""
        comments_dict = parse_event_comments(self.feedback_data)
        comments = get_comments_for_event(comments_dict, "Event 1")
        
        self.assertEqual(len(comments), 3)
        self.assertIn("Great event", comments[0])
    
    def test_prepare_audience_by_college_success(self):
        """Test successful preparation of audience by college."""
        result_df = prepare_audience_by_college(self.audience_data)
        
        self.assertEqual(len(result_df), 2)
        self.assertEqual(result_df.loc[result_df["college"] == "Engineering", "students"].values[0], 150)
        self.assertEqual(result_df.loc[result_df["college"] == "Business", "students"].values[0], 75)
    
    def test_calculate_percentage_success(self):
        """Test successful percentage calculation."""
        result = calculate_percentage(25, 100)
        self.assertEqual(result, 25.0)
    
    def test_calculate_percentage_zero_total(self):
        """Test percentage calculation with zero total."""
        result = calculate_percentage(25, 0)
        self.assertEqual(result, 0.0)


if __name__ == "__main__":
    unittest.main()
