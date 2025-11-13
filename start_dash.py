#!/usr/bin/env python3
"""
Helper script to start the Dash analytics dashboard.
This script provides better error handling and instructions.
"""

import sys
import subprocess

def main():
    """Main function to start the Dash app."""
    print("=" * 60)
    print("Starting Organizer Analytics Dashboard")
    print("=" * 60)
    print()
    
    # Check Python version
    if sys.version_info < (3, 7):
        print("ERROR: Python 3.7 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    
    # Check dependencies
    try:
        import dash
        import pandas
        import plotly
    except ImportError as e:
        print(f"ERROR: Missing dependency: {e.name}")
        print("\nPlease install dependencies by running:")
        print("  pip install -r requirements.txt")
        sys.exit(1)
    
    print("✓ All required dependencies are installed.")
    print()
    print("Starting Dash server on http://localhost:8050...")
    print("Press Ctrl+C to stop the server.")
    print()
    
    # Run the app directly
    try:
        # Import and run app.py
        import app
    except KeyboardInterrupt:
        print("\n\nServer stopped by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\nERROR: Failed to start app: {str(e)}")
        print("\nTroubleshooting:")
        print("  1. Make sure Docker is running: docker compose up -d")
        print("  2. Check if port 8050 is already in use")
        print("  3. Verify database connection in config.py")
        print("  4. Check data files exist in ./data/ directory")
        print("  5. Review error messages above for specific issues")
        sys.exit(1)

if __name__ == "__main__":
    main()

