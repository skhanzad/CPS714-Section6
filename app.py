# ===========================================
# Main app file - handles the dashboard setup and routing
# =====================================================
# This is where everything comes together
# Dash app, callbacks, data load









import dash
from dash import dcc, html, Input, Output, State
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
    create_audience_major_bar_chart,
    ChartGenerationError
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
app = dash.Dash(__name__, suppress_callback_exceptions=True)
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
    Handles errors gracefully - continues creating other charts even if one fails.
    """
    global events_with_rates_df, feedback_df
    global audience_by_college_df, audience_by_major_df
    
    charts = {}
    
    # Only create charts if we have data, with error handling for each
    try:
        if events_with_rates_df is not None and not events_with_rates_df.empty:
            try:
                charts["rsvp_attendance"] = create_rsvp_attendance_comparison_chart(events_with_rates_df)
            except (ChartGenerationError, Exception) as e:
                logger.error(f"Failed to create RSVP/Attendance chart: {str(e)}")
                charts["rsvp_attendance"] = {}
            
            try:
                charts["attendance_rate"] = create_attendance_rate_chart(events_with_rates_df)
            except (ChartGenerationError, Exception) as e:
                logger.error(f"Failed to create attendance rate chart: {str(e)}")
                charts["attendance_rate"] = {}
    
    except Exception as e:
        logger.error(f"Error processing events data for charts: {str(e)}")
    
    try:
        if feedback_df is not None and not feedback_df.empty:
            try:
                charts["feedback_rating"] = create_feedback_rating_chart(feedback_df)
            except (ChartGenerationError, Exception) as e:
                logger.error(f"Failed to create feedback rating chart: {str(e)}")
                charts["feedback_rating"] = {}
    except Exception as e:
        logger.error(f"Error processing feedback data for charts: {str(e)}")
    
    try:
        if audience_by_college_df is not None and not audience_by_college_df.empty:
            try:
                charts["audience_college"] = create_audience_college_pie_chart(audience_by_college_df)
            except (ChartGenerationError, Exception) as e:
                logger.error(f"Failed to create audience college chart: {str(e)}")
                charts["audience_college"] = {}
    except Exception as e:
        logger.error(f"Error processing audience college data for charts: {str(e)}")
    
    try:
        if audience_by_major_df is not None and not audience_by_major_df.empty:
            try:
                charts["audience_major"] = create_audience_major_bar_chart(audience_by_major_df)
            except (ChartGenerationError, Exception) as e:
                logger.error(f"Failed to create audience major chart: {str(e)}")
                charts["audience_major"] = {}
    except Exception as e:
        logger.error(f"Error processing audience major data for charts: {str(e)}")
    
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
    Handles errors gracefully.
    """
    try:
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
        
        # Initialize the dropdown in the layout so it exists from the start
        # This allows the State to reference it in the callback
        initial_dropdown = create_event_comments_dropdown(event_names, initial_comments, initial_event_name, None)
        
        # Build the full dashboard layout
        return html.Div([
        # Hidden interval component for auto-refresh
        dcc.Interval(
            id='interval-component',
            interval=1*1000,  # Refresh every 5 seconds (in milliseconds)
            n_intervals=0
        ),
        
        # Top header
        create_header(),
        
        # Stats cards at the top
        html.Div(id='statistics-row-container'),
        

        #########################
        # ----------------------------------------
        # Event Performance section

        create_section_container([
            create_section_header("Event Performance Reports", "#3498db"),
            html.Div(id="events-performance-table-container"),
            html.Div([
                dcc.Graph(
                    id="rsvp-attendance-chart",
                    style={"height": "100%"}
                )
            ], style={"flex": "1", "marginBottom": "20px"}),
            html.Div([
                dcc.Graph(
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
                id="feedback-rating-chart"
            ),
            html.Div(id="comments-dropdown-container", children=initial_dropdown)
        ]),
        

        #############################################################################################################################
        # ----------------------------------------
        # Audience section
        create_section_container([
            create_section_header("Audience Insights", "#9b59b6"),
            html.Div([
                html.Div([
                    dcc.Graph(
                        id="audience-college-chart"
                    )
                ], style={"flex": "1", "marginRight": "10px"}),
                html.Div([
                    dcc.Graph(
                        id="audience-major-chart"
                    )
                ], style={"flex": "1", "marginLeft": "10px"})
            ], style={"display": "flex", "marginBottom": "20px"}),
            html.Div(id="audience-breakdown-table-container")
        ])
        
    ], style={
        "maxWidth": "1400px",
        "margin": "0 auto",
        "padding": "20px",
        "backgroundColor": "#f5f6fa",
        "fontFamily": "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    })
    
    except Exception as e:
        logger.error(f"Error creating dashboard layout: {str(e)}")
        return html.Div([
            create_header(),
            create_error_message(f"Error building dashboard: {str(e)}")
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
    [
        Output('statistics-row-container', 'children'),
        Output("events-performance-table-container", 'children'),
        Output("rsvp-attendance-chart", 'figure'),
        Output("attendance-rate-chart", 'figure'),
        Output("feedback-rating-chart", 'figure'),
        Output("audience-college-chart", 'figure'),
        Output("audience-major-chart", 'figure'),
        Output("audience-breakdown-table-container", 'children'),
        Output("comments-dropdown-container", 'children')
    ],
    Input('interval-component', 'n_intervals'),
    State('event-comments-dropdown', 'value'),
    prevent_initial_call=False
)
def update_dashboard(n_intervals, current_dropdown_value):
    """
    Refreshes all dashboard data and visualizations periodically.
    This ensures new feedback entries appear automatically.
    Runs on page load (n_intervals=0) and every 5 seconds thereafter.
    """
    global events_df, feedback_df, audience_df
    global events_with_rates_df, statistics
    global comments_by_event, audience_by_college_df, audience_by_major_df
    global error_message
    
    try:
        # Reload and process data
        load_and_process_data()
        
        # If there's an error, return error messages
        if error_message:
            error_div = create_error_message(error_message)
            empty_fig = {}
            empty_div = html.Div()
            return (
                empty_div,  # statistics-row-container
                empty_div,  # events-performance-table-container
                empty_fig,  # rsvp-attendance-chart
                empty_fig,  # attendance-rate-chart
                empty_fig,  # feedback-rating-chart
                empty_fig,  # audience-college-chart
                empty_fig,  # audience-major-chart
                empty_div,  # audience-breakdown-table-container
                error_div   # comments-dropdown-container
            )
        
        # Reinitialize charts with fresh data
        charts = initialize_charts()
        
        # Get updated event names for comments dropdown
        event_names = list(comments_by_event.keys()) if comments_by_event else []
        
        # Set up initial comments display
        initial_comments = []
        initial_event_name = "No Event Selected"
        if event_names and comments_by_event:
            # Use current dropdown value if it's still valid, otherwise use first event
            if current_dropdown_value and current_dropdown_value in event_names:
                initial_event_name = current_dropdown_value
            else:
                initial_event_name = event_names[0]
            initial_comments = get_comments_for_event(comments_by_event, initial_event_name)
        
        return (
            create_statistics_row(statistics),  # statistics-row-container
            create_events_performance_table(events_with_rates_df),  # events-performance-table-container
            charts.get("rsvp_attendance", {}),  # rsvp-attendance-chart
            charts.get("attendance_rate", {}),  # attendance-rate-chart
            charts.get("feedback_rating", {}),  # feedback-rating-chart
            charts.get("audience_college", {}),  # audience-college-chart
            charts.get("audience_major", {}),  # audience-major-chart
            create_audience_breakdown_table(audience_df, statistics["total_students"]),  # audience-breakdown-table-container
            create_event_comments_dropdown(event_names, initial_comments, initial_event_name, current_dropdown_value)  # comments-dropdown-container
        )
        
    except Exception as e:
        logger.error(f"Error updating dashboard: {str(e)}")
        error_div = create_error_message(f"Error refreshing data: {str(e)}")
        empty_fig = {}
        empty_div = html.Div()
        return (
            empty_div,  # statistics-row-container
            empty_div,  # events-performance-table-container
            empty_fig,  # rsvp-attendance-chart
            empty_fig,  # attendance-rate-chart
            empty_fig,  # feedback-rating-chart
            empty_fig,  # audience-college-chart
            empty_fig,  # audience-major-chart
            empty_div,  # audience-breakdown-table-container
            error_div   # comments-dropdown-container
        )


@app.callback(
    Output("comments-display-container", "children"),
    Input("event-comments-dropdown", "value")
)
def update_comments_display(selected_event):
    """
    Updates the comments section when user picks a different event.
    Handles errors gracefully.
    """
    global comments_by_event
    
    try:
        # Handle empty selection
        if not selected_event or selected_event is None:
            return create_comments_display([], "No Event Selected")
        
        if not comments_by_event:
            return create_comments_display([], "No Comments Available")
        
        # Get the comments for this event
        comments = get_comments_for_event(comments_by_event, selected_event)
        return create_comments_display(comments, selected_event)
    
    except Exception as e:
        logger.error(f"Error updating comments display: {str(e)}")
        return create_comments_display(
            [], 
            f"Error loading comments: {str(e)}"
        )





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
