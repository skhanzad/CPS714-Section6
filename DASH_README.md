# How to Start the Dash Analytics Dashboard

The Organizer Analytics & Reporting Dashboard is a Python Dash application that needs to be running separately from your Next.js app.

## Quick Start

1. **Make sure Docker is running** (for PostgreSQL database):
   ```bash
   docker compose up -d
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the Dash app**:
   ```bash
   python app.py
   ```
   
   Or use the helper script:
   ```bash
   python start_dash.py
   ```

4. **Verify it's running**:
   - You should see: "Starting Organizer Analytics Dashboard on http://0.0.0.0:8050"
   - Open http://localhost:8050 in your browser to verify
   - The dashboard should load with charts and data

5. **Access from Next.js app**:
   - Navigate to http://localhost:3001/organizer/analytics
   - The dashboard will be embedded in the page

## Troubleshooting

### "Unable to Load Dashboard" Error

If you see this error in the Next.js app:

1. **Check if Dash app is running**:
   - Look for the terminal where you ran `python app.py`
   - It should show "Running on http://0.0.0.0:8050"
   - If not, start it with `python app.py`

2. **Check database connection**:
   - Make sure Docker is running: `docker compose up -d`
   - Check if PostgreSQL container is running: `docker ps`
   - Verify database credentials in `.env` file

3. **Check port 8050**:
   - Make sure port 8050 is not already in use
   - Try accessing http://localhost:8050 directly in your browser
   - If it loads there, the issue might be with iframe embedding

4. **Use CSV files instead of database**:
   - If database connection fails, you can use CSV files
   - Edit `config.py` and set `DUMMY_MODE = True`
   - Make sure CSV files exist in `./data/` directory:
     - `events.csv`
     - `feedback.csv`
     - `audience.csv`

### Database Connection Errors

If you see database connection errors:

1. **Check Docker is running**:
   ```bash
   docker ps
   ```
   You should see a `cps714_postgres` container running.

2. **Check database credentials**:
   - Verify `.env` file has correct database settings
   - Default values:
     - Host: `localhost`
     - Port: `5432`
     - User: `root`
     - Password: `admin`
     - Database: `campus_connect_db`

3. **Restart Docker containers**:
   ```bash
   docker compose down
   docker compose up -d
   ```

### Missing Dependencies

If you see import errors:

```bash
pip install -r requirements.txt
```

### Port Already in Use

If port 8050 is already in use:

1. Find the process using port 8050:
   ```bash
   # Windows
   netstat -ano | findstr :8050
   
   # Mac/Linux
   lsof -i :8050
   ```

2. Kill the process or change the port in `config.py`:
   ```python
   DEFAULT_PORT = 8051  # or another available port
   ```

3. Update the analytics page URL in `src/app/organizer/analytics/page.tsx` or set environment variable:
   ```bash
   NEXT_PUBLIC_DASH_URL=http://localhost:8051
   ```

## Configuration

### Using CSV Files (DUMMY_MODE)

If you want to use CSV files instead of the database:

1. Edit `config.py`:
   ```python
   DUMMY_MODE = True
   ```

2. Make sure CSV files exist in `./data/` directory with the correct format:
   - `events.csv`: event_name, rsvp_count, actual_attendance
   - `feedback.csv`: event_name, avg_rating, feedback_count
   - `audience.csv`: college, major, students

### Changing Port

To change the port the Dash app runs on:

1. Edit `config.py`:
   ```python
   DEFAULT_PORT = 8051  # or your preferred port
   ```

2. Update Next.js environment variable or analytics page:
   ```bash
   NEXT_PUBLIC_DASH_URL=http://localhost:8051
   ```

## Development

The Dash app runs independently of the Next.js app. You need to:

1. Keep the Dash app running in one terminal
2. Keep the Next.js app running in another terminal
3. Both should be running simultaneously for the analytics page to work

## Production

For production deployment, you'll need to:

1. Deploy the Dash app as a separate service
2. Update the `NEXT_PUBLIC_DASH_URL` environment variable to point to the production Dash app URL
3. Ensure CORS and iframe headers are properly configured (already done in `app.py`)

