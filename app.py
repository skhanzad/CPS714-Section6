"""
Main application module for the Organizer Analytics Dashboard.

This module initializes the Dash application, sets up callbacks, and
handles the overall application flow with comprehensive error handling.
"""

import dash
from dash import dcc, html, Input, Output
from flask import request, make_response
import webbrowser
from threading import Timer
import logging

from config import (
    APP_TITLE,
    APP_DESCRIPTION,
    DEFAULT_HOST,
    DEFAULT_PORT,
    DEBUG_MODE,
    ERROR_MESSAGES
)

from data_loader import load_all_data, DataLoadError
from data_processor import (
    calculate_attendance_rate,
    calculate_summary_statistics,
    parse_event_comments,
    get_comments_for_event,
    prepare_audience_by_college,
    prepare_audience_by_major,
    DataProcessingError
)
from chart_generator import (
    create_rsvp_attendance_comparison_chart,
    create_attendance_rate_chart,
    create_feedback_rating_chart,
    create_audience_college_pie_chart,
    create_audience_major_bar_chart
)
from ui_components import (
    create_header,
    create_statistics_row,
    create_section_header,
    create_events_performance_table,
    create_event_comments_dropdown,
    create_comments_display,
    create_audience_breakdown_table,
    create_section_container,
    create_error_message
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Dash application
app = dash.Dash(__name__)
app.title = APP_TITLE

# Configure server to allow iframe embedding
# Remove X-Frame-Options header to allow embedding in iframes
@app.server.after_request
def remove_xframe_options(response):
    response.headers.pop('X-Frame-Options', None)
    # Add CORS headers to allow cross-origin requests
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Handle OPTIONS requests for CORS preflight
@app.server.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# Global variables to store loaded data
events_df = None
feedback_df = None
audience_df = None
events_with_rates_df = None
statistics = None
comments_by_event = None
audience_by_college_df = None
audience_by_major_df = None
error_message = None


def initialize_charts():
    """
    Initialize all charts with current data.
    
    Returns:
        Dictionary containing chart figures
    """
    global events_with_rates_df, feedback_df
    global audience_by_college_df, audience_by_major_df
    
    charts = {}
    
    if events_with_rates_df is not None and not events_with_rates_df.empty:
        charts["rsvp_attendance"] = create_rsvp_attendance_comparison_chart(events_with_rates_df)
        charts["attendance_rate"] = create_attendance_rate_chart(events_with_rates_df)
    
    if feedback_df is not None and not feedback_df.empty:
        charts["feedback_rating"] = create_feedback_rating_chart(feedback_df)
    
    if audience_by_college_df is not None and not audience_by_college_df.empty:
        charts["audience_college"] = create_audience_college_pie_chart(audience_by_college_df)
    
    if audience_by_major_df is not None and not audience_by_major_df.empty:
        charts["audience_major"] = create_audience_major_bar_chart(audience_by_major_df)
    
    return charts


def load_and_process_data():
    """
    Load and process all data for the dashboard.
    
    Returns:
        tuple: (success: bool, error_message: str or None)
    """
    global events_df, feedback_df, audience_df
    global events_with_rates_df, statistics
    global comments_by_event, audience_by_college_df, audience_by_major_df
    global error_message
    
    try:
        # Load data
        events_df, feedback_df, audience_df = load_all_data()
        
        # Process events data
        events_with_rates_df = calculate_attendance_rate(events_df)
        
        # Calculate statistics
        statistics = calculate_summary_statistics(events_df, feedback_df, audience_df)
        
        # Parse comments
        comments_by_event = parse_event_comments(feedback_df)
        
        # Prepare audience data
        audience_by_college_df = prepare_audience_by_college(audience_df)
        audience_by_major_df = prepare_audience_by_major(audience_df)
        
        error_message = None
        logger.info("Data loaded and processed successfully.")
        return True, None
    
    except (DataLoadError, DataProcessingError) as e:
        error_message = str(e)
        logger.error(f"Error loading/processing data: {error_message}")
        return False, error_message
    except Exception as e:
        error_message = f"Unexpected error: {str(e)}"
        logger.error(f"Unexpected error: {error_message}")
        return False, error_message


def create_dashboard_layout():
    """
    Create the main dashboard layout.
    
    Returns:
        HTML Div containing the dashboard layout
    """
    if error_message:
        return html.Div([
            create_header(),
            create_error_message(error_message)
        ], style={
            "maxWidth": "1400px",
            "margin": "0 auto",
            "padding": "20px",
            "backgroundColor": "#f5f6fa",
            "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        })
    
    # Get event names for dropdown
    event_names = list(comments_by_event.keys()) if comments_by_event else []
    
    # Initialize charts
    charts = initialize_charts()
    
    # Get initial comments for first event (if available)
    initial_comments = []
    initial_event_name = "No Event Selected"
    if event_names and comments_by_event:
        initial_event_name = event_names[0]
        initial_comments = get_comments_for_event(comments_by_event, initial_event_name)
    
    return html.Div([
        # Header
        create_header(),
        
        # Summary Statistics
        create_statistics_row(statistics),
        
        # Event Performance Reports Section
        create_section_container([
            create_section_header("Event Performance Reports", "#3498db"),
            create_events_performance_table(events_with_rates_df),
            html.Div([
                dcc.Graph(
                    figure=charts.get("rsvp_attendance", {}),
                    id="rsvp-attendance-chart",
                    style={"height": "100%"}
                )
            ], style={"flex": "1", "marginBottom": "20px"}),
            html.Div([
                dcc.Graph(
                    figure=charts.get("attendance_rate", {}),
                    id="attendance-rate-chart"
                )
            ], style={"marginBottom": "30px"})
        ]),
        
        # Feedback Summary Section
        create_section_container([
            create_section_header("Feedback Summary", "#e74c3c"),
            dcc.Graph(
                figure=charts.get("feedback_rating", {}),
                id="feedback-rating-chart"
            ),
            create_event_comments_dropdown(event_names, initial_comments, initial_event_name)
        ]),
        
        # Audience Insights Section
        create_section_container([
            create_section_header("Audience Insights", "#9b59b6"),
            html.Div([
                html.Div([
                    dcc.Graph(
                        figure=charts.get("audience_college", {}),
                        id="audience-college-chart"
                    )
                ], style={"flex": "1", "marginRight": "10px"}),
                html.Div([
                    dcc.Graph(
                        figure=charts.get("audience_major", {}),
                        id="audience-major-chart"
                    )
                ], style={"flex": "1", "marginLeft": "10px"})
            ], style={"display": "flex", "marginBottom": "20px"}),
            create_audience_breakdown_table(audience_df, statistics["total_students"])
        ])
        
    ], style={
        "maxWidth": "1400px",
        "margin": "0 auto",
        "padding": "20px",
        "backgroundColor": "#f5f6fa",
        "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    })


# Set up layout
success, error = load_and_process_data()
app.layout = create_dashboard_layout()


# Callback for updating comments display based on dropdown selection
@app.callback(
    Output("comments-display-container", "children"),
    Input("event-comments-dropdown", "value")
)
def update_comments_display(selected_event):
    """
    Update the comments display when a different event is selected.
    
    Args:
        selected_event: Name of the selected event (can be None)
    
    Returns:
        HTML Div containing the comments for the selected event
    """
    global comments_by_event
    
    # Handle case when no event is selected or no comments available
    if not selected_event or selected_event is None:
        return create_comments_display([], "No Event Selected")
    
    if not comments_by_event:
        return create_comments_display([], "No Comments Available")
    
    # Get comments for the selected event
    comments = get_comments_for_event(comments_by_event, selected_event)
    return create_comments_display(comments, selected_event)


def open_browser():
    """Open the web browser to the dashboard URL."""
    try:
        # Use localhost for browser URL even though server listens on 0.0.0.0
        webbrowser.open_new(f"http://localhost:{DEFAULT_PORT}/")
    except Exception as e:
        logger.warning(f"Could not open browser automatically: {str(e)}")


if __name__ == "__main__":
    if success:
        logger.info(f"Starting {APP_TITLE} on http://{DEFAULT_HOST}:{DEFAULT_PORT}")
        logger.info(f"Dashboard will be available at: http://localhost:{DEFAULT_PORT}")
        # Only open browser in the actual server process (reloader child), not the parent process
        import os
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not DEBUG_MODE:
            Timer(1, open_browser).start()
        app.run(debug=DEBUG_MODE, host=DEFAULT_HOST, port=DEFAULT_PORT, use_reloader=DEBUG_MODE)
    else:
        logger.error(f"Failed to load data: {error_message}")
        logger.error("Starting server anyway to display error message...")
        logger.info(f"Starting {APP_TITLE} on http://{DEFAULT_HOST}:{DEFAULT_PORT}")
        logger.info(f"Dashboard will be available at: http://localhost:{DEFAULT_PORT}")
        # Start server even with errors so user can see the error message
        app.run(debug=DEBUG_MODE, host=DEFAULT_HOST, port=DEFAULT_PORT, use_reloader=DEBUG_MODE)
