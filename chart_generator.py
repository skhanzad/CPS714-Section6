# ============================================================================
# Chart generation functions
# ============================================================================
# All the chart creation logic is here here 






import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from typing import Optional
import logging

from config import (
    COLORS,
    CHART_HEIGHT_PERFORMANCE,
    CHART_HEIGHT_STANDARD,
    CHART_HEIGHT_MAJOR,
    CHART_FONT_FAMILY,
    CHART_FONT_SIZE,
    ERROR_MESSAGES
)

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Custom exception for chart generation errors
class ChartGenerationError(Exception):
    """Exception raised when chart generation fails."""
    pass









# ============================================================================
# RSVP vs Attendance comparison chart
def create_rsvp_attendance_comparison_chart(events_df: pd.DataFrame) -> go.Figure:
    """
    Creates a grouped bar chart showing RSVP count vs actual attendance.
    Takes events dataframe and returns a Plotly figure.
    """
    try:
        if events_df is None or events_df.empty:
            raise ChartGenerationError("Events dataframe is empty or None. Cannot create chart.")
        
        required_columns = ["event_name", "rsvp_count", "actual_attendance"]
        missing_columns = [col for col in required_columns if col not in events_df.columns]
        if missing_columns:
            raise ChartGenerationError(f"Missing required columns for RSVP/Attendance chart: {', '.join(missing_columns)}")
        
        figure = go.Figure()
        
        max_value = max(events_df["rsvp_count"].max(), events_df["actual_attendance"].max())
        if pd.isna(max_value) or max_value == 0:
            max_value = 100  # Default max if all values are 0/NaN
        yaxis_max = max_value * 1.15  
        
        # Add the RSVP bars
        figure.add_trace(go.Bar(
            name="RSVP Count",
            x=events_df["event_name"],
            y=events_df["rsvp_count"],
            marker_color=COLORS["primary"],
            text=events_df["rsvp_count"],
            textposition="outside",
            hovertemplate="<b>%{x}</b><br>RSVP Count: %{y}<extra></extra>"
        ))
        
        # Add the actual attendance bars
        figure.add_trace(go.Bar(
            name="Actual Attendance",
            x=events_df["event_name"],
            y=events_df["actual_attendance"],
            marker_color=COLORS["success"],
            text=events_df["actual_attendance"],
            textposition="outside",
            hovertemplate="<b>%{x}</b><br>Actual Attendance: %{y}<extra></extra>"
        ))
        
        # Style the chart
        figure.update_layout(
            title="Event Performance: RSVP vs Actual Attendance",
            xaxis_title="Event Name",
            yaxis_title="Number of People",
            yaxis=dict(range=[0, yaxis_max]),
            barmode="group",
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family=CHART_FONT_FAMILY, size=CHART_FONT_SIZE),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            height=CHART_HEIGHT_PERFORMANCE,
            hovermode="closest",
            margin=dict(t=120, b=50, l=50, r=50)  # Extra top margin for title
        )
        
        return figure
    
    except Exception as e:
        logger.error(f"Error creating RSVP/Attendance comparison chart: {str(e)}")
        raise ChartGenerationError(f"{ERROR_MESSAGES['calculation_error']} RSVP/Attendance chart: {str(e)}")







# ==========================================
# Attendance rate chart
# =======
def create_attendance_rate_chart(events_df: pd.DataFrame) -> go.Figure:
    """
    Bar chart showing attendance rates per event.
    Uses a blue color scale to show higher rates.
    """
    try:
        if events_df is None or events_df.empty:
            raise ChartGenerationError("Events dataframe is empty or None. Cannot create attendance rate chart.")
        
        if "attendance_rate" not in events_df.columns:
            raise ChartGenerationError("Missing 'attendance_rate' column. Cannot create attendance rate chart.")
        
        if "event_name" not in events_df.columns:
            raise ChartGenerationError("Missing 'event_name' column. Cannot create attendance rate chart.")
        
        min_rate = events_df["attendance_rate"].min()
        max_rate = events_df["attendance_rate"].max()
        
        # Handle NaN/None values
        if pd.isna(min_rate):
            min_rate = 0
        if pd.isna(max_rate):
            max_rate = 100

        #########################
        # Set y-axis max with some padding
        yaxis_max = max(100, max_rate * 1.15)  #######
        
        figure = px.bar(
            events_df,
            x="event_name",
            y="attendance_rate",
            title="Attendance Rate (%)",
            text=events_df["attendance_rate"].apply(lambda x: f"{x}%"),
            color="attendance_rate",
            color_continuous_scale=[[0, "#4a90e2"], [1, "#1e3a8a"]],  # Blue gradient
            range_color=[min_rate, max_rate],
            labels={"attendance_rate": "Attendance Rate (%)", "event_name": "Event Name"}
        )
        
        #####styling

        figure.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family=CHART_FONT_FAMILY, size=CHART_FONT_SIZE),
            height=CHART_HEIGHT_STANDARD,
            yaxis=dict(range=[0, yaxis_max]),
            showlegend=False,
            hovermode="closest",
            margin=dict(t=120, b=50, l=50, r=50)
        )
        
        figure.update_traces(
            textposition="outside",
            hovertemplate="<b>%{x}</b><br>Attendance Rate: %{y}%<extra></extra>"
        )
        
        return figure
    
    except Exception as e:
        logger.error(f"Error creating attendance rate chart: {str(e)}")
        raise ChartGenerationError(f"{ERROR_MESSAGES['calculation_error']} Attendance rate chart: {str(e)}")










# Feedback rating chart
def create_feedback_rating_chart(feedback_df: pd.DataFrame) -> go.Figure:
    """
    Shows average feedback ratings for each event.
    Uses yellow-orange-red color scale (YlOrRd) from Plotly.
    """
    try:
        if feedback_df is None or feedback_df.empty:
            raise ChartGenerationError("Feedback dataframe is empty or None. Cannot create feedback rating chart.")
        
        if "avg_rating" not in feedback_df.columns:
            raise ChartGenerationError("Missing 'avg_rating' column. Cannot create feedback rating chart.")
        
        if "event_name" not in feedback_df.columns:
            raise ChartGenerationError("Missing 'event_name' column. Cannot create feedback rating chart.")
        
        max_rating = feedback_df["avg_rating"].max()
        if pd.isna(max_rating):
            max_rating = 5  
        
        if max_rating <= 5:
            yaxis_max = 5
        else:
            yaxis_max = max(5, max_rating * 1.15)  
        
        # Create the chart
        figure = px.bar(
            feedback_df,
            x="event_name",
            y="avg_rating",
            color="avg_rating",
            color_continuous_scale="YlOrRd",  
            title="Average Feedback Rating per Event (1–5)",
            text=feedback_df["avg_rating"].round(1),
            labels={"avg_rating": "Average Rating", "event_name": "Event Name"}
        )
       
        figure.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family=CHART_FONT_FAMILY, size=CHART_FONT_SIZE),
            height=CHART_HEIGHT_STANDARD,
            yaxis=dict(range=[0, yaxis_max]),
            showlegend=False,
            hovermode="closest",
            margin=dict(t=120, b=50, l=50, r=50)
        )
        
        figure.update_traces(
            textposition="outside",
            hovertemplate="<b>%{x}</b><br>Average Rating: %{y:.1f}/5<extra></extra>"
        )
        
        return figure
    
    except Exception as e:
        logger.error(f"Error creating feedback rating chart: {str(e)}")
        raise ChartGenerationError(f"{ERROR_MESSAGES['calculation_error']} Feedback rating chart: {str(e)}")










# Audience by college pie chart
def create_audience_college_pie_chart(audience_by_college_df: pd.DataFrame) -> go.Figure:
    """
    Pie chart showing how students are distributed across colleges.
    """
    try:
        if audience_by_college_df is None or audience_by_college_df.empty:
            raise ChartGenerationError("Audience dataframe is empty or None. Cannot create college pie chart.")
        
        if "college" not in audience_by_college_df.columns:
            raise ChartGenerationError("Missing 'college' column. Cannot create college pie chart.")
        
        if "students" not in audience_by_college_df.columns:
            raise ChartGenerationError("Missing 'students' column. Cannot create college pie chart.")
        
        figure = px.pie(
            audience_by_college_df,
            names="college",
            values="students",
            title="Audience Distribution by College",
            color_discrete_sequence=px.colors.qualitative.Set3  
        )
    
        figure.update_traces(
            textposition="inside",
            textinfo="percent+label",
            hovertemplate="<b>%{label}</b><br>Students: %{value}<br>Percentage: %{percent}<extra></extra>"
        )
        
        figure.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family=CHART_FONT_FAMILY, size=CHART_FONT_SIZE),
            height=CHART_HEIGHT_STANDARD,
            hovermode="closest"
        )
        
        return figure
    
    except Exception as e:
        logger.error(f"Error creating audience college pie chart: {str(e)}")
        raise ChartGenerationError(f"{ERROR_MESSAGES['calculation_error']} College pie chart: {str(e)}")



###########################################################################
##################################################
#########################
# ========================#########################=========####======



# Audience by major bar chart
def create_audience_major_bar_chart(audience_by_major_df: pd.DataFrame) -> go.Figure:
    """
    Horizontal bar chart showing student distribution by major.
    Color-coded by college so you can see which majors belong to which college.
    """
    try:
        if audience_by_major_df is None or audience_by_major_df.empty:
            raise ChartGenerationError("Audience dataframe is empty or None. Cannot create major bar chart.")
        
        required_columns = ["students", "major", "college"]
        missing_columns = [col for col in required_columns if col not in audience_by_major_df.columns]
        if missing_columns:
            raise ChartGenerationError(f"Missing required columns for major bar chart: {', '.join(missing_columns)}")
        
        figure = px.bar(
            audience_by_major_df,
            x="students",
            y="major",
            color="college",
            orientation="h",  
            title="Audience Distribution by Major",
            labels={"students": "Number of Students", "major": "Major", "college": "College"},
            color_discrete_sequence=px.colors.qualitative.Set3
        )
        
        # Sort by total students ascending (smallest at top)
        figure.update_layout(
            plot_bgcolor="rgba(0,0,0,0)",
            paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family=CHART_FONT_FAMILY, size=CHART_FONT_SIZE),
            height=CHART_HEIGHT_MAJOR,
            yaxis={"categoryorder": "total ascending"},
            hovermode="closest"
        )
        
        
        figure.update_traces(
            hovertemplate="<b>%{y}</b><br>College: %{customdata[0]}<br>Students: %{x}<extra></extra>",
            customdata=audience_by_major_df[["college"]]
        )
        
        return figure
    
    except Exception as e:
        logger.error(f"Error creating audience major bar chart: {str(e)}")
        raise ChartGenerationError(f"{ERROR_MESSAGES['calculation_error']} Major bar chart: {str(e)}")

