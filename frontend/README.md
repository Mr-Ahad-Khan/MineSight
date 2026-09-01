# Coal Governance Frontend – SIH 26024

Modern, government-grade React frontend for **AI-Based Smart Governance and Compliance Monitoring System for Coal Mines**.

---

## Tech Stack

- React 18 + Vite
- Tailwind CSS (Dark/Light mode)
- React Router v6
- Zustand (state)
- Axios
- Recharts (analytics)
- Leaflet / React-Leaflet (GIS maps)
- Lucide React (icons)
- React Hot Toast

---

## Features

- Beautiful Login with quick demo roles
- Role-based Dashboard with live KPIs
- Inspections list + Create form with **geo-tagging map**
- Inspection detail with risk score, violations, actions
- Compliances tracker + overdue alerts
- Mines list + interactive GIS map
- Contractors management
- Alerts center
- AI Analytics page (charts + recurring violations)
- Dark / Light mode toggle
- Fully responsive

---

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

Make sure backend is running on port 5000.

---

## Demo Credentials

| Role          | Email                    | Password  |
|---------------|--------------------------|-----------|
| Mine Official | rajesh@ncl.gov.in        | mine123   |
| Corporate     | corporate@cil.gov.in     | corp123   |
| Admin         | admin@cil.gov.in         | admin123  |
| Regulator     | regulator@dgms.gov.in    | reg123    |

---

## Project Structure

```
src/
├── components/
│   ├── layout/       (Sidebar, Navbar, Layout)
│   └── dashboard/    (StatCard, RiskDistribution, etc.)
├── pages/            (All route pages)
├── services/api.js   (Axios instance + all API calls)
├── store/            (authStore, themeStore)
├── App.jsx
├── main.jsx
└── index.css
```

---

**Built for Smart India Hackathon 2026**  
Ministry of Coal | Coal India Limited
```

# Deployment configuration

For Vercel production deployments, set `BACKEND_URL` to the public origin of
the backend service (for example, `https://your-api.onrender.com`). Do not set
it to the frontend URL (`https://mine-sight.vercel.app`), which would make the
API call itself recursively. The Vercel catch-all function at `/api/*` forwards
same-origin API traffic to that backend URL.

`VITE_API_URL` is optional and is intended only for an explicitly configured
client API endpoint. When it is omitted, development uses
`http://localhost:5000/api` and production uses the Vercel proxy.
