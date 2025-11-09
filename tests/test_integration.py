"""
Integration tests for the Organizer Analytics Dashboard.

These tests verify that all modules work together correctly.
"""

import unittest
import pandas as pd
import tempfile
import os
from unittest.mock import patch

from data_loader import load_all_data, DataLoadError
from data_processor import (
    calculate_attendance_rate,
    calculate_summary_statistics,
    parse_event_comments
)
from chart_generator import (
    create_rsvp_attendance_comparison_chart,
    create_feedback_rating_chart
)


class TestIntegration(unittest.TestCase):
    """Integration test cases."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.test_data_dir = tempfile.mkdtemp()
        
        # Create test CSV files
        events_df = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "rsvp_count": [100, 200],
            "actual_attendance": [80, 150]
        })
        events_df.to_csv(os.path.join(self.test_data_dir, "events.csv"), index=False)
        
        feedback_df = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "avg_rating": [4.5, 4.8],
            "feedback_count": [20, 30],
            "comments": ["Great;Excellent", "Amazing;Wonderful"]
        })
        feedback_df.to_csv(os.path.join(self.test_data_dir, "feedback.csv"), index=False)
        
        audience_df = pd.DataFrame({
            "college": ["Engineering", "Business"],
            "major": ["CS", "Finance"],
            "students": [100, 50]
        })
        audience_df.to_csv(os.path.join(self.test_data_dir, "audience.csv"), index=False)
    
    @patch('data_loader.DUMMY_MODE', True)
    @patch('data_loader.EVENTS_CSV_PATH')
    @patch('data_loader.FEEDBACK_CSV_PATH')
    @patch('data_loader.AUDIENCE_CSV_PATH')
    def test_full_data_pipeline(self, mock_audience_path, mock_feedback_path, mock_events_path):
        """Test the complete data loading and processing pipeline."""
        mock_events_path.return_value = os.path.join(self.test_data_dir, "events.csv")
        mock_feedback_path.return_value = os.path.join(self.test_data_dir, "feedback.csv")
        mock_audience_path.return_value = os.path.join(self.test_data_dir, "audience.csv")
        
        # Load data
        events_df, feedback_df, audience_df = load_all_data()
        
        # Process data
        events_with_rates = calculate_attendance_rate(events_df)
        statistics = calculate_summary_statistics(events_df, feedback_df, audience_df)
        comments = parse_event_comments(feedback_df)
        
        # Verify results
        self.assertEqual(len(events_with_rates), 2)
        self.assertIn("attendance_rate", events_with_rates.columns)
        self.assertGreater(statistics["total_rsvp"], 0)
        self.assertIn("Event 1", comments)
    
    def test_chart_generation_with_processed_data(self):
        """Test chart generation with processed data."""
        events_df = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "rsvp_count": [100, 200],
            "actual_attendance": [80, 150],
            "attendance_rate": [80.0, 75.0]
        })
        
        feedback_df = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "avg_rating": [4.5, 4.8]
        })
        
        # Generate charts
        rsvp_chart = create_rsvp_attendance_comparison_chart(events_df)
        feedback_chart = create_feedback_rating_chart(feedback_df)
        
        # Verify charts were created
        self.assertIsNotNone(rsvp_chart)
        self.assertIsNotNone(feedback_chart)


if __name__ == "__main__":
    unittest.main()

