# Test runner script
# Runs all the unit tests for the dashboard

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))





# Import all test modules
from tests.test_data_loader import TestDataLoader
from tests.test_data_processor import TestDataProcessor
from tests.test_chart_generator import TestChartGenerator
from tests.test_ui_components import TestUIComponents














# Main test runner function
def run_tests():
    """Runs all unit tests and returns exit code."""
    # Set up test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test cases
    suite.addTests(loader.loadTestsFromTestCase(TestDataLoader))
    suite.addTests(loader.loadTestsFromTestCase(TestDataProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestChartGenerator))
    suite.addTests(loader.loadTestsFromTestCase(TestUIComponents))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Return 0 if all passed, 1 if any failed
    return 0 if result.wasSuccessful() else 1

if __name__ == "__main__":
    exit_code = run_tests()
    sys.exit(exit_code)






