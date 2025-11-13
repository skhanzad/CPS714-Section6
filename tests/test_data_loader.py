"""
Unit tests for the data_loader module.
"""

import unittest
import pandas as pd
import os
import tempfile
from unittest.mock import patch, MagicMock

import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from data_loader import (
    load_events_from_csv,
    load_feedback_from_csv,
    load_audience_from_csv,
    validate_dataframe,
    DataLoadError,
    load_all_data
)


class TestDataLoader(unittest.TestCase):
    """Test cases for data loading functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_data_dir = tempfile.mkdtemp()
        
        # Create valid test data
        self.valid_events_data = {
            "event_name": ["Event 1", "Event 2"],
            "rsvp_count": [100, 200],
            "actual_attendance": [80, 150]
        }
        
        self.valid_feedback_data = {
            "event_name": ["Event 1", "Event 2"],
            "avg_rating": [4.5, 4.8],
            "feedback_count": [20, 30],
            "comments": ["Great event;Excellent", "Amazing;Wonderful"]
        }
        
        self.valid_audience_data = {
            "college": ["Engineering", "Business"],
            "major": ["CS", "Finance"],
            "students": [100, 50]
        }
    
    def test_validate_dataframe_success(self):
        """Test successful dataframe validation."""
        df = pd.DataFrame(self.valid_events_data)
        required_columns = ["event_name", "rsvp_count", "actual_attendance"]
        
        # Should not raise an exception
        try:
            validate_dataframe(df, required_columns, "Events")
        except DataLoadError:
            self.fail("validate_dataframe raised DataLoadError unexpectedly")
    
    def test_validate_dataframe_empty(self):
        """Test validation with empty dataframe."""
        df = pd.DataFrame()
        required_columns = ["event_name", "rsvp_count"]
        
        with self.assertRaises(DataLoadError):
            validate_dataframe(df, required_columns, "Events")
    
    def test_validate_dataframe_missing_columns(self):
        """Test validation with missing columns."""
        df = pd.DataFrame({"event_name": ["Event 1"]})
        required_columns = ["event_name", "rsvp_count"]
        
        with self.assertRaises(DataLoadError):
            validate_dataframe(df, required_columns, "Events")
    
    def test_load_events_from_csv_success(self):
        """Test successful loading of events from CSV."""
        # Create temporary CSV file
        df = pd.DataFrame(self.valid_events_data)
        csv_path = os.path.join(self.test_data_dir, "events.csv")
        df.to_csv(csv_path, index=False)
        
        # Load and validate
        result_df = load_events_from_csv(csv_path)
        self.assertEqual(len(result_df), 2)
        self.assertIn("event_name", result_df.columns)
        self.assertIn("rsvp_count", result_df.columns)
        self.assertIn("actual_attendance", result_df.columns)
    
    def test_load_events_from_csv_file_not_found(self):
        """Test loading events from non-existent file."""
        with self.assertRaises(DataLoadError):
            load_events_from_csv("nonexistent_file.csv")
    
    def test_load_events_from_csv_invalid_rsvp(self):
        """Test loading events with invalid RSVP data."""
        invalid_data = {
            "event_name": ["Event 1"],
            "rsvp_count": ["invalid"],
            "actual_attendance": [80]
        }
        df = pd.DataFrame(invalid_data)
        csv_path = os.path.join(self.test_data_dir, "events_invalid.csv")
        df.to_csv(csv_path, index=False)
        
        with self.assertRaises(DataLoadError):
            load_events_from_csv(csv_path)
    
    def test_load_events_from_csv_negative_values(self):
        """Test loading events with negative values."""
        invalid_data = {
            "event_name": ["Event 1"],
            "rsvp_count": [-10],
            "actual_attendance": [80]
        }
        df = pd.DataFrame(invalid_data)
        csv_path = os.path.join(self.test_data_dir, "events_negative.csv")
        df.to_csv(csv_path, index=False)
        
        with self.assertRaises(DataLoadError):
            load_events_from_csv(csv_path)
    
    def test_load_feedback_from_csv_success(self):
        """Test successful loading of feedback from CSV."""
        df = pd.DataFrame(self.valid_feedback_data)
        csv_path = os.path.join(self.test_data_dir, "feedback.csv")
        df.to_csv(csv_path, index=False)
        
        result_df = load_feedback_from_csv(csv_path)
        self.assertEqual(len(result_df), 2)
        self.assertIn("event_name", result_df.columns)
        self.assertIn("avg_rating", result_df.columns)
    
    def test_load_feedback_from_csv_invalid_rating(self):
        """Test loading feedback with invalid rating."""
        invalid_data = {
            "event_name": ["Event 1"],
            "avg_rating": [10],  # Invalid: should be 1-5
            "feedback_count": [20]
        }
        df = pd.DataFrame(invalid_data)
        csv_path = os.path.join(self.test_data_dir, "feedback_invalid.csv")
        df.to_csv(csv_path, index=False)
        
        with self.assertRaises(DataLoadError):
            load_feedback_from_csv(csv_path)
    
    def test_load_audience_from_csv_success(self):
        """Test successful loading of audience from CSV."""
        df = pd.DataFrame(self.valid_audience_data)
        csv_path = os.path.join(self.test_data_dir, "audience.csv")
        df.to_csv(csv_path, index=False)
        
        result_df = load_audience_from_csv(csv_path)
        self.assertEqual(len(result_df), 2)
        self.assertIn("college", result_df.columns)
        self.assertIn("major", result_df.columns)
        self.assertIn("students", result_df.columns)


if __name__ == "__main__":
    unittest.main()
