"""
Test runner script for the Organizer Analytics Dashboard.

This script runs all unit tests and displays the results.
"""

import unittest
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Import test modules
from tests.test_data_loader import TestDataLoader
from tests.test_data_processor import TestDataProcessor
from tests.test_chart_generator import TestChartGenerator
from tests.test_ui_components import TestUIComponents


def run_tests():
    """Run all unit tests."""
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add test cases
    suite.addTests(loader.loadTestsFromTestCase(TestDataLoader))
    suite.addTests(loader.loadTestsFromTestCase(TestDataProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestChartGenerator))
    suite.addTests(loader.loadTestsFromTestCase(TestUIComponents))
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return exit code based on test results
    return 0 if result.wasSuccessful() else 1


if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)

