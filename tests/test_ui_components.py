"""
Unit tests for the ui_components module.
"""

import unittest
import pandas as pd
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ui_components import (
    create_header,
    create_statistics_card,
    create_statistics_row,
    create_section_header,
    create_events_performance_table,
    create_event_comments_dropdown,
    create_comments_display,
    create_audience_breakdown_table,
    create_section_container,
    create_error_message
)


class TestUIComponents(unittest.TestCase):
    """Test cases for UI components functionality."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.events_data = pd.DataFrame({
            "event_name": ["Event 1", "Event 2"],
            "rsvp_count": [100, 200],
            "actual_attendance": [80, 150],
            "attendance_rate": [80.0, 75.0]
        })
        
        self.audience_data = pd.DataFrame({
            "college": ["Engineering", "Business"],
            "major": ["CS", "Finance"],
            "students": [100, 50]
        })
        
        self.statistics = {
            "total_rsvp": 300,
            "total_attendance": 230,
            "overall_attendance_rate": 76.7,
            "avg_rating": 4.5
        }
    
    def test_create_header(self):
        """Test header creation."""
        header = create_header()
        self.assertIsNotNone(header)
    
    def test_create_statistics_card(self):
        """Test statistics card creation."""
        card = create_statistics_card("100", "Test Label", "#3498db")
        self.assertIsNotNone(card)
        self.assertEqual(len(card.children), 2)
    
    def test_create_statistics_row(self):
        """Test statistics row creation."""
        row = create_statistics_row(self.statistics)
        self.assertIsNotNone(row)
        self.assertEqual(len(row.children), 4)  # Four statistic cards
    
    def test_create_section_header(self):
        """Test section header creation."""
        header = create_section_header("Test Section", "#3498db")
        self.assertIsNotNone(header)
        self.assertEqual(header.children, "Test Section")
    
    def test_create_events_performance_table(self):
        """Test events performance table creation."""
        table = create_events_performance_table(self.events_data)
        self.assertIsNotNone(table)
    
    def test_create_event_comments_dropdown(self):
        """Test event comments dropdown creation."""
        event_names = ["Event 1", "Event 2"]
        dropdown = create_event_comments_dropdown(event_names)
        self.assertIsNotNone(dropdown)
    
    def test_create_comments_display_with_comments(self):
        """Test comments display with comments."""
        comments = ["Comment 1", "Comment 2"]
        display = create_comments_display(comments, "Event 1")
        self.assertIsNotNone(display)
    
    def test_create_comments_display_empty(self):
        """Test comments display with no comments."""
        comments = []
        display = create_comments_display(comments, "Event 1")
        self.assertIsNotNone(display)
    
    def test_create_audience_breakdown_table(self):
        """Test audience breakdown table creation."""
        table = create_audience_breakdown_table(self.audience_data, 150)
        self.assertIsNotNone(table)
    
    def test_create_section_container(self):
        """Test section container creation."""
        children = [create_section_header("Test", "#3498db")]
        container = create_section_container(children)
        self.assertIsNotNone(container)
    
    def test_create_error_message(self):
        """Test error message creation."""
        error_msg = create_error_message("Test error message")
        self.assertIsNotNone(error_msg)


if __name__ == "__main__":
    unittest.main()
