"""
Unit tests for the chart_generator module.
"""

import unittest
import pandas as pd
import plotly.graph_objects as go
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from chart_generator import (
    create_rsvp_attendance_comparison_chart,
    create_attendance_rate_chart,
    create_feedback_rating_chart,
    create_audience_college_pie_chart,
    create_audience_major_bar_chart
)


class TestChartGenerator(unittest.TestCase):
    """Test cases for chart generation functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.events_data = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "rsvp_count": [100, 200],
            "actual_attendance": [80, 150],
            "attendance_rate": [80.0, 75.0]
        })
        
        self.feedback_data = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "avg_rating": [4.5, 4.8]
        })
        
        self.audience_college_data = pd.DataFrame({
            "college": ["Engineering", "Business"],
            "students": [150, 75]
        })
        
        self.audience_major_data = pd.DataFrame({
            "major": ["CS", "Finance"],
            "students": [100, 50],
            "college": ["Engineering", "Business"]
        })
    
    def test_create_rsvp_attendance_comparison_chart_success(self):
        """Test successful creation of RSVP vs Attendance chart."""
        figure = create_rsvp_attendance_comparison_chart(self.events_data)
        
        self.assertIsInstance(figure, go.Figure)
        self.assertEqual(len(figure.data), 2)  # Two bar traces
        self.assertEqual(figure.layout.title.text, "Event Performance: RSVP vs Actual Attendance")
    
    def test_create_attendance_rate_chart_success(self):
        """Test successful creation of attendance rate chart."""
        figure = create_attendance_rate_chart(self.events_data)
        
        self.assertIsInstance(figure, go.Figure)
        self.assertEqual(figure.layout.title.text, "Attendance Rate (%)")
    
    def test_create_feedback_rating_chart_success(self):
        """Test successful creation of feedback rating chart."""
        figure = create_feedback_rating_chart(self.feedback_data)
        
        self.assertIsInstance(figure, go.Figure)
        self.assertEqual(figure.layout.title.text, "Average Feedback Rating per Event (1–5)")
        self.assertEqual(figure.layout.yaxis.range[1], 5)
    
    def test_create_audience_college_pie_chart_success(self):
        """Test successful creation of audience college pie chart."""
        figure = create_audience_college_pie_chart(self.audience_college_data)
        
        self.assertIsInstance(figure, go.Figure)
        self.assertEqual(figure.layout.title.text, "Audience Distribution by College")
    
    def test_create_audience_major_bar_chart_success(self):
        """Test successful creation of audience major bar chart."""
        figure = create_audience_major_bar_chart(self.audience_major_data)
        
        self.assertIsInstance(figure, go.Figure)
        self.assertEqual(figure.layout.title.text, "Audience Distribution by Major")


if __name__ == "__main__":
    unittest.main()
