# Weather Analytics Pipeline

An end-to-end data analytics project that ingests live weather data, stores it in Supabase (PostgreSQL), aggregates it with SQL, and visualizes daily temperature trends using Python.

## Tech Stack
- n8n (scheduled ingestion)
- Supabase (PostgreSQL + REST API)
- SQL (views & aggregation)
- Python (Pandas, Matplotlib)
- Jupyter Notebook

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
- `weather_analysis.ipynb` — data retrieval + visualization
