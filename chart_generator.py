# ============================================================================
# Chart generation functions
# ============================================================================
# All the chart creation logic is here here 






import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
from typing import Optional

from config import (
    COLORS,
    CHART_HEIGHT_PERFORMANCE,
    CHART_HEIGHT_STANDARD,
    CHART_HEIGHT_MAJOR,
    CHART_FONT_FAMILY,
    CHART_FONT_SIZE
)









# ============================================================================
# RSVP vs Attendance comparison chart
def create_rsvp_attendance_comparison_chart(events_df: pd.DataFrame) -> go.Figure:
    """
    Creates a grouped bar chart showing RSVP count vs actual attendance.
    Takes events dataframe and returns a Plotly figure.
    """
    figure = go.Figure()
    

    max_value = max(events_df["rsvp_count"].max(), events_df["actual_attendance"].max())
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







# ==========================================
# Attendance rate chart
# =======
def create_attendance_rate_chart(events_df: pd.DataFrame) -> go.Figure:
    """
    Bar chart showing attendance rates per event.
    Uses a blue color scale to show higher rates.
    """
    
    min_rate = events_df["attendance_rate"].min()
    max_rate = events_df["attendance_rate"].max()
    

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










# Feedback rating chart
def create_feedback_rating_chart(feedback_df: pd.DataFrame) -> go.Figure:
    """
    Shows average feedback ratings for each event.
    Uses yellow-orange-red color scale (YlOrRd) from Plotly.
    """
    
    max_rating = feedback_df["avg_rating"].max()
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










# Audience by college pie chart
def create_audience_college_pie_chart(audience_by_college_df: pd.DataFrame) -> go.Figure:
    """
    Pie chart showing how students are distributed across colleges.
    """
    figure = px.pie(
        audience_by_college_df,
        names="college",
        values="students",
        title="Audience Distribution by College",
        color_discrete_sequence=px.colors.qualitative.Set3  
    )



    
    # Show percentage and label inside the slices
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

