#!/usr/bin/env python3
# Dashboard startup script
# Just run: python start_dash.py

import sys
import subprocess

# Main startup function
# ============================================================



def main():
    """Starts the Dash app with some basic checks."""
    print("=" * 60)
    print("Starting Organizer Analytics Dashboard")
    print("=" * 60)
    print()
    
    # Check Python version first
    if sys.version_info < (3, 7):
        print("ERROR: Python 3.7 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    









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
    









    # Import and start the app
    try:
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

