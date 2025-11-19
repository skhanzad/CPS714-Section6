# Test runner script
# Runs all the unit tests for the dashboard

import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

# Set DUMMY_MODE to True for tests (use CSV files instead of database)
# This ensures tests don't require a database connection
import config
config.DUMMY_MODE = True

# Import all test modules
from tests.test_data_loader import TestDataLoader
from tests.test_data_processor import TestDataProcessor
from tests.test_chart_generator import TestChartGenerator
from tests.test_ui_components import TestUIComponents














# Main test runner function
def run_tests():
    """Runs all unit tests and returns exit code."""
    try:
        # Set up test suite
        loader = unittest.TestLoader()
        suite = unittest.TestSuite()
        
        # Add all test cases with error handling
        try:
            suite.addTests(loader.loadTestsFromTestCase(TestDataLoader))
        except Exception as e:
            print(f"WARNING: Failed to load TestDataLoader: {str(e)}", file=sys.stderr)
        
        try:
            suite.addTests(loader.loadTestsFromTestCase(TestDataProcessor))
        except Exception as e:
            print(f"WARNING: Failed to load TestDataProcessor: {str(e)}", file=sys.stderr)
        
        try:
            suite.addTests(loader.loadTestsFromTestCase(TestChartGenerator))
        except Exception as e:
            print(f"WARNING: Failed to load TestChartGenerator: {str(e)}", file=sys.stderr)
        
        try:
            suite.addTests(loader.loadTestsFromTestCase(TestUIComponents))
        except Exception as e:
            print(f"WARNING: Failed to load TestUIComponents: {str(e)}", file=sys.stderr)
        
        if suite.countTestCases() == 0:
            print("ERROR: No test cases were loaded.", file=sys.stderr)
            return 1
        
        # Run the tests
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        # Return 0 if all passed, 1 if any failed
        return 0 if result.wasSuccessful() else 1
    
    except Exception as e:
        print(f"ERROR: Failed to run tests: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    try:
        exit_code = run_tests()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user.", file=sys.stderr)
        sys.exit(130)  # Standard exit code for Ctrl+C
    except Exception as e:
        print(f"\nERROR: Unexpected error in test runner: {str(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)






