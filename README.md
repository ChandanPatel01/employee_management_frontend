# Employee Management Frontend

React frontend for the Spring Boot Employee Management API.

## Requirements

- Node.js 20 or newer
- The Spring Boot backend running on `http://localhost:8080`

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The Vite dev server proxies `/api` requests to `http://localhost:8080`, so the React app can call the existing backend endpoints without changing API URLs.
