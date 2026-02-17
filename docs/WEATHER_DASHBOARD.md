# Weather Pipeline Web App (Supabase)

Simple no-build web app that reads weather rows from Supabase and renders live charts.

## Files

- `web/index.html` UI layout
- `web/styles.css` visual theme
- `web/main.js` Supabase query + chart logic

## Run

Because this app uses ES modules, serve it with a local static server:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

The root page redirects to the dashboard in `web/`.

## Supabase assumptions

The UI now has `Schema` + `Table` inputs. Defaults are:

- Schema: `public`
- Table: `weather_data`

Change these to match your actual Supabase table.

Required columns:

- `id`
- `city`
- `timestamp`
- `temperature`
- `humidity`
- `pressure`
- `wind_speed`

If you see a query permissions error, add an RLS policy allowing `SELECT` for `anon` on this table.

## Auto-update behavior

- Refreshes every 5 minutes
- Also supports manual refresh button
- n8n can keep writing hourly; the dashboard picks up new rows automatically
