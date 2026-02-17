# Weather Analytics Pipeline

An end-to-end weather analytics project with:
- automated ingestion via n8n
- storage in Supabase (PostgreSQL)
- a live browser dashboard
- notebook-based analysis

## Tech Stack
- n8n (scheduled ingestion)
- Supabase (PostgreSQL + REST API)
- HTML/CSS/JavaScript (live dashboard)
- SQL (views & aggregation)
- Python (Pandas, Matplotlib)
- Jupyter Notebook

## Repo Structure
- `web/` - Weather Pipeline Web App (dashboard)
- `analysis/` - notebooks and analysis artifacts
- `workflows/n8n/` - n8n workflow exports
- `docs/` - supporting docs

## Web App
- App entry: `web/index.html`
- GitHub Pages root redirect: `index.html` -> `web/`
- Dashboard docs: `docs/WEATHER_DASHBOARD.md`

## Pipeline Flow
1. Hourly weather data ingestion via API
2. Data stored in Supabase PostgreSQL
3. SQL view generates daily temperature summaries
4. Python notebook fetches aggregated data via REST
5. Visualization of average, min, and max temperatures

## Key Skills Demonstrated
- Data pipelines & automation
- REST API consumption
- SQL aggregation & views
- Python data analysis
- Data visualization

## Notebook
- `analysis/weather_analysis.ipynb` — data retrieval + visualization
