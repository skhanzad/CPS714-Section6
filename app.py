# ===========================================
# Main app file - handles the dashboard setup and routing
# =====================================================
# This is where everything comes together
# Dash app, callbacks, data load









import dash
from dash import dcc, html, Input, Output
from flask import request, make_response
import webbrowser
from threading import Timer
import logging







# Imports from our modules
# =============================================
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







# Logging setup
# ===========================================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)






# ===============================================================
# Initialize the Dash app
app = dash.Dash(__name__)
app.title = APP_TITLE




# ============================================================================
# CORS and iframe stuf

@app.server.after_request
def remove_xframe_options(response):
    response.headers.pop('X-Frame-Options', None)
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response





@app.server.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response




#====
# Global data storage
# =====================================================
events_df = None
feedback_df = None
audience_df = None
events_with_rates_df = None
statistics = None
comments_by_event = None
audience_by_college_df = None
audience_by_major_df = None
error_message = None

####################################################################################################


# =========================
# Chart initialization
# ======================================================
def initialize_charts():
    """
    Creates all the charts we need for the dashboard.
    Returns a dict with all the chart figures.
    """
    global events_with_rates_df, feedback_df
    global audience_by_college_df, audience_by_major_df
    
    charts = {}
    
    # Only create charts if we have data
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





# ==========================================================
# Data loading and processing
# ==============================================
def load_and_process_data():
    """
    Loads all the data and processes it for the dashboard.
    Returns (success, error_message) tuple.
    """
    global events_df, feedback_df, audience_df
    global events_with_rates_df, statistics
    global comments_by_event, audience_by_college_df, audience_by_major_df
    global error_message
    
    try:
        # Load the raw data first
        events_df, feedback_df, audience_df = load_all_data()
        
        # Calculate attendance rates for events
        events_with_rates_df = calculate_attendance_rate(events_df)
        
        # Get summary stats
        statistics = calculate_summary_statistics(events_df, feedback_df, audience_df)
        
        # Extract comments from feedback
        comments_by_event = parse_event_comments(feedback_df)
        
        # Group audience data by college and major
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






#########################
#########################
#########################

# ====================================================
# Dashboard layout creation
def create_dashboard_layout():
    """
    Builds the main dashboard layout with all sections.
    Returns the HTML structure for the dashboard.
    """
    # Show error if something went wrong
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
    



    # Get list of events that have comments
    event_names = list(comments_by_event.keys()) if comments_by_event else []
    
    # Create all the charts
    charts = initialize_charts()
    
    # Set up initial comments display
    initial_comments = []
    initial_event_name = "No Event Selected"
    if event_names and comments_by_event:
        initial_event_name = event_names[0]
        initial_comments = get_comments_for_event(comments_by_event, initial_event_name)
    
    # Build the full dashboard layout
    return html.Div([
        # Top header
        create_header(),
        
        # Stats cards at the top
        create_statistics_row(statistics),
        

        #########################
        # ----------------------------------------
        # Event Performance section

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
        

        #########################
        # ----------------------------------------
        # Feedback section
        create_section_container([
            create_section_header("Feedback Summary", "#e74c3c"),
            dcc.Graph(
                figure=charts.get("feedback_rating", {}),
                id="feedback-rating-chart"
            ),
            create_event_comments_dropdown(event_names, initial_comments, initial_event_name)
        ]),
        

        #############################################################################################################################
        # ----------------------------------------
        # Audience section
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




#########################
#########################
# ======================================
# Load data and set up layout
# 
success, error = load_and_process_data()
app.layout = create_dashboard_layout()

#########################
#########################
#########################
# ==================================================
# Callbacks
# 
@app.callback(
    Output("comments-display-container", "children"),
    Input("event-comments-dropdown", "value")
)
def update_comments_display(selected_event):
    """
    Updates the comments section when user picks a different event.
    """
    global comments_by_event
    
    # Handle empty selection
    if not selected_event or selected_event is None:
        return create_comments_display([], "No Event Selected")
    
    if not comments_by_event:
        return create_comments_display([], "No Comments Available")
    
    # Get the comments for this event
    comments = get_comments_for_event(comments_by_event, selected_event)
    return create_comments_display(comments, selected_event)





# =================================================
# Browser opening helper
# ==========================================================
def open_browser():
    """Opens browser to the dashboard URL."""
    try:
        # Use localhost even though server listens on 0.0.0.0
        webbrowser.open_new(f"http://localhost:{DEFAULT_PORT}/")
    except Exception as e:
        logger.warning(f"Could not open browser automatically: {str(e)}")


#########################
#########################
#########################
#########################






# ====================================================================
# Main entry point
###########
if __name__ == "__main__":
    if success:
        logger.info(f"Starting {APP_TITLE} on http://{DEFAULT_HOST}:{DEFAULT_PORT}")
        logger.info(f"Dashboard will be available at: http://localhost:{DEFAULT_PORT}")
        # Only open browser in the actual server process, not the parent
        import os
        if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not DEBUG_MODE:
            Timer(1, open_browser).start()
        app.run(debug=DEBUG_MODE, host=DEFAULT_HOST, port=DEFAULT_PORT, use_reloader=DEBUG_MODE)
    else:
        logger.error(f"Failed to load data: {error_message}")
        logger.error("Starting server anyway to display error message...")
        logger.info(f"Starting {APP_TITLE} on http://{DEFAULT_HOST}:{DEFAULT_PORT}")
        logger.info(f"Dashboard will be available at: http://localhost:{DEFAULT_PORT}")
        # Start server even with errors so user can see what went wrong
        app.run(debug=DEBUG_MODE, host=DEFAULT_HOST, port=DEFAULT_PORT, use_reloader=DEBUG_MODE)
