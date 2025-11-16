# ============================================================================
# UI components module
# ============================================================================
# All the reusable UI components for the dashboard
# Keeps styling consistent and makes the code cleaner

from dash import html, dcc
from typing import List, Dict
import pandas as pd

from config import COLORS, APP_TITLE, APP_DESCRIPTION


# ============================================================================
# Header component
# ============================================================================
def create_header() -> html.Div:
    """
    Creates the dashboard header with title and description.
    """
    return html.Div([
        html.H1(
            APP_TITLE,
            style={
                "textAlign": "center",
                "color": COLORS["dark"],
                "marginBottom": "10px",
                "fontWeight": "700"
            }
        ),
        html.P(
            APP_DESCRIPTION,
            style={
                "textAlign": "center",
                "color": COLORS["muted"],
                "fontSize": "18px",
                "marginBottom": "30px"
            }
        )
    ], style={
        "backgroundColor": COLORS["white"],
        "padding": "30px",
        "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
        "marginBottom": "20px"
    })


# ============================================================================
# Statistics cards
# ============================================================================
def create_statistics_card(value: str, label: str, color: str) -> html.Div:
    """
    Creates a single stat card with a value and label.
    Used for the summary stats at the top of the dashboard.
    """
    return html.Div([
        html.H3(
            value,
            style={
                "margin": "0",
                "color": color,
                "fontSize": "36px",
                "fontWeight": "700"
            }
        ),
        html.P(
            label,
            style={
                "margin": "5px 0 0 0",
                "color": COLORS["muted"],
                "fontSize": "14px"
            }
        )
    ], style={
        "backgroundColor": COLORS["white"],
        "padding": "25px",
        "borderRadius": "8px",
        "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
        "textAlign": "center",
        "flex": "1",
        "margin": "0 10px"
    })


def create_statistics_row(statistics: Dict[str, float]) -> html.Div:
    """
    Creates a row of stat cards for the top of the dashboard.
    Shows total RSVPs, attendance, attendance rate, and avg rating.
    """
    return html.Div([
        create_statistics_card(
            f"{statistics['total_rsvp']:,}",
            "Total RSVPs",
            COLORS["primary"]
        ),
        create_statistics_card(
            f"{statistics['total_attendance']:,}",
            "Total Attendance",
            COLORS["success"]
        ),
        create_statistics_card(
            f"{statistics['overall_attendance_rate']:.1f}%",
            "Overall Attendance Rate",
            COLORS["info"]
        ),
        create_statistics_card(
            f"{statistics['avg_rating']:.1f}",
            "Average Rating",
            COLORS["danger"]
        )
    ], style={
        "display": "flex",
        "marginBottom": "30px",
        "gap": "10px"
    })


# ============================================================================
# Section headers
# ============================================================================
def create_section_header(title: str, border_color: str) -> html.H2:
    """
    Creates a section header with a colored left border.
    Used to separate different sections of the dashboard.
    """
    return html.H2(
        title,
        style={
            "color": COLORS["dark"],
            "marginBottom": "20px",
            "fontWeight": "600",
            "borderLeft": f"4px solid {border_color}",
            "paddingLeft": "15px"
        }
    )


# ============================================================================
# Tables
# ============================================================================
def create_events_performance_table(events_df: pd.DataFrame) -> html.Div:
    """
    Creates a table showing event performance metrics.
    Displays event name, RSVP count, actual attendance, and attendance rate.
    """
    table_rows = [
        html.Tr([
            html.Td(
                row["event_name"],
                style={
                    "padding": "12px",
                    "borderBottom": "1px solid #ecf0f1"
                }
            ),
            html.Td(
                f"{row['rsvp_count']:,}",
                style={
                    "padding": "12px",
                    "textAlign": "center",
                    "borderBottom": "1px solid #ecf0f1",
                    "fontWeight": "600",
                    "color": COLORS["primary"]
                }
            ),
            html.Td(
                f"{row['actual_attendance']:,}",
                style={
                    "padding": "12px",
                    "textAlign": "center",
                    "borderBottom": "1px solid #ecf0f1",
                    "fontWeight": "600",
                    "color": COLORS["success"]
                }
            ),
            html.Td(
                f"{row['attendance_rate']:.1f}%",
                style={
                    "padding": "12px",
                    "textAlign": "center",
                    "borderBottom": "1px solid #ecf0f1",
                    "fontWeight": "600"
                }
            )
        ]) for _, row in events_df.iterrows()
    ]
    
    return html.Div([
        html.Table([
            html.Thead([
                html.Tr([
                    html.Th(
                        "Event Name",
                        style={
                            "padding": "12px",
                            "textAlign": "left",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "RSVP Count",
                        style={
                            "padding": "12px",
                            "textAlign": "center",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "Actual Attendance",
                        style={
                            "padding": "12px",
                            "textAlign": "center",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "Attendance Rate",
                        style={
                            "padding": "12px",
                            "textAlign": "center",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    )
                ])
            ]),
            html.Tbody(table_rows)
        ], style={
            "width": "100%",
            "borderCollapse": "collapse",
            "backgroundColor": "white",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
            "borderRadius": "8px",
            "overflow": "hidden"
        })
    ], style={"marginBottom": "30px"})


# ============================================================================
# Comments dropdown
# ============================================================================
def create_event_comments_dropdown(event_names: List[str], initial_comments: List[str] = None, initial_event_name: str = None) -> html.Div:
    """
    Creates a dropdown to select which event's comments to view.
    Includes the dropdown and the display area for comments.
    """
    # Need to include components with IDs even when empty (for callbacks)
    if not event_names:
        return html.Div([
            html.H3(
                "View Feedback Comments by Event",
                style={
                    "color": COLORS["dark"],
                    "marginBottom": "15px",
                    "fontWeight": "600"
                }
            ),
            html.P(
                "No events with feedback comments available.",
                style={
                    "color": COLORS["muted"],
                    "marginBottom": "10px",
                    "fontSize": "14px",
                    "fontStyle": "italic"
                }
            ),
            # Dropdown with empty options (hidden but needed for callbacks)
            dcc.Dropdown(
                id="event-comments-dropdown",
                options=[],
                value=None,
                placeholder="No events available",
                disabled=True,
                style={
                    "marginBottom": "20px",
                    "backgroundColor": COLORS["white"],
                    "display": "none"  # Hide when empty
                }
            ),
            # Container for comments (needed for callbacks)
            html.Div(
                id="comments-display-container",
                children=create_comments_display(
                    [],
                    "No Event Selected"
                )
            )
        ], style={"marginTop": "30px"})
    
    return html.Div([
        html.H3(
            "View Feedback Comments by Event",
            style={
                "color": COLORS["dark"],
                "marginBottom": "15px",
                "fontWeight": "600"
            }
        ),
        html.P(
            "Select an event from the dropdown to view aggregated feedback comments:",
            style={
                "color": COLORS["muted"],
                "marginBottom": "10px",
                "fontSize": "14px"
            }
        ),
        dcc.Dropdown(
            id="event-comments-dropdown",
            options=[{"label": name, "value": name} for name in event_names],
            value=event_names[0],
            placeholder="Select an event...",
            clearable=False,
            style={
                "marginBottom": "20px",
                "backgroundColor": COLORS["white"]
            }
        ),
        html.Div(
            id="comments-display-container",
            children=create_comments_display(
                initial_comments if initial_comments else [],
                initial_event_name if initial_event_name else (event_names[0] if event_names else "No Event")
            )
        )
    ], style={"marginTop": "30px"})


# ============================================================================
# Comments display
# ============================================================================
def create_comments_display(comments: List[str], event_name: str) -> html.Div:
    """
    Creates the display area for event comments.
    Shows each comment in a styled box.
    """
    if not comments:
        return html.Div([
            html.P(
                f"No comments available for {event_name}.",
                style={
                    "color": COLORS["muted"],
                    "fontStyle": "italic",
                    "padding": "20px",
                    "textAlign": "center"
                }
            )
        ])
    
    comment_elements = [
        html.Div([
            html.P(
                comment,
                style={
                    "color": "#555",
                    "margin": "0 0 10px 0",
                    "lineHeight": "1.6",
                    "padding": "12px",
                    "backgroundColor": "#f8f9fa",
                    "borderRadius": "4px",
                    "borderLeft": "3px solid #e74c3c"
                }
            )
        ]) for comment in comments
    ]
    
    return html.Div([
        html.H4(
            f"Comments for {event_name}",
            style={
                "color": COLORS["danger"],
                "marginBottom": "15px",
                "fontSize": "18px",
                "fontWeight": "600"
            }
        ),
        html.Div(
            comment_elements,
            style={
                "maxHeight": "400px",
                "overflowY": "auto",
                "padding": "10px"
            }
        )
    ])


# ============================================================================
# Audience breakdown table
# ============================================================================
def create_audience_breakdown_table(audience_df: pd.DataFrame, total_students: int) -> html.Div:
    """
    Creates a detailed table showing audience breakdown by college and major.
    Includes student counts and percentages.
    """
    table_rows = [
        html.Tr([
            html.Td(
                row["college"],
                style={
                    "padding": "12px",
                    "borderBottom": "1px solid #ecf0f1",
                    "fontWeight": "600"
                }
            ),
            html.Td(
                row["major"],
                style={
                    "padding": "12px",
                    "borderBottom": "1px solid #ecf0f1"
                }
            ),
            html.Td(
                f"{row['students']:,}",
                style={
                    "padding": "12px",
                    "textAlign": "center",
                    "borderBottom": "1px solid #ecf0f1",
                    "fontWeight": "600",
                    "color": COLORS["info"]
                }
            ),
            html.Td(
                f"{(row['students']/total_students*100):.1f}%" if total_students > 0 else "0%",
                style={
                    "padding": "12px",
                    "textAlign": "center",
                    "borderBottom": "1px solid #ecf0f1"
                }
            )
        ]) for _, row in audience_df.sort_values(
            ["college", "students"],
            ascending=[True, False]
        ).iterrows()
    ]
    
    return html.Div([
        html.H3(
            "Detailed Audience Breakdown by College and Major",
            style={
                "color": COLORS["dark"],
                "marginTop": "30px",
                "marginBottom": "15px",
                "fontWeight": "600"
            }
        ),
        html.Table([
            html.Thead([
                html.Tr([
                    html.Th(
                        "College",
                        style={
                            "padding": "12px",
                            "textAlign": "left",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "Major",
                        style={
                            "padding": "12px",
                            "textAlign": "left",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "Number of Students",
                        style={
                            "padding": "12px",
                            "textAlign": "center",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    ),
                    html.Th(
                        "Percentage",
                        style={
                            "padding": "12px",
                            "textAlign": "center",
                            "backgroundColor": "#34495e",
                            "color": "white",
                            "fontWeight": "600"
                        }
                    )
                ])
            ]),
            html.Tbody(table_rows)
        ], style={
            "width": "100%",
            "borderCollapse": "collapse",
            "backgroundColor": "white",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
            "borderRadius": "8px",
            "overflow": "hidden"
        })
    ])


# ============================================================================
# Section container
# ============================================================================
def create_section_container(children: List, background_color: str = COLORS["white"]) -> html.Div:
    """
    Creates a styled container for dashboard sections.
    Adds padding, rounded corners, and shadow.
    """
    return html.Div(
        children,
        style={
            "backgroundColor": background_color,
            "padding": "30px",
            "borderRadius": "8px",
            "boxShadow": "0 2px 4px rgba(0,0,0,0.1)",
            "marginBottom": "20px"
        }
    )


# ============================================================================
# Error message component
# ============================================================================
def create_error_message(message: str) -> html.Div:
    """
    Creates an error message display component.
    Shows when data loading or processing fails.
    """
    return html.Div([
        html.H3(
            "Error",
            style={
                "color": COLORS["danger"],
                "marginBottom": "10px"
            }
        ),
        html.P(
            message,
            style={
                "color": COLORS["muted"],
                "padding": "20px",
                "backgroundColor": "#fee",
                "borderRadius": "4px",
                "borderLeft": "4px solid #e74c3c"
            }
        )
    ], style={
        "padding": "30px",
        "margin": "20px auto",
        "maxWidth": "800px"
    })

