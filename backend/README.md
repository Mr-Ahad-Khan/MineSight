# Coal Governance Backend – SIH 26024

**AI-Based Smart Governance and Compliance Monitoring System for Coal Mines**

Backend built with **Node.js + Express + MongoDB** (plain JavaScript).

---

## Features

- JWT Authentication + Role Based Access Control (RBAC)
- Mine Management
- Inspection Management (with geo-location & risk scoring)
- Compliance Tracker
- Contractor Management
- Real-time Alerts
- AI-style Risk Score Calculator
- Dashboard Summary & Analytics
- Offline-ready inspection creation (offlineId support)
- Socket.io ready for real-time updates

---

## Folder Structure

```
backend/
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── mineController.js
│   ├── inspectionController.js
│   ├── complianceController.js
│   ├── dashboardController.js
│   ├── alertController.js
│   └── contractorController.js
├── middleware/
│   ├── auth.js
│   └── errorHandler.js
├── models/
│   ├── User.js
│   ├── Mine.js
│   ├── Inspection.js
│   ├── Compliance.js
│   ├── Contractor.js
│   ├── Alert.js
│   └── AuditLog.js
├── routes/
│   ├── authRoutes.js
│   ├── mineRoutes.js
│   ├── inspectionRoutes.js
│   ├── complianceRoutes.js
│   ├── dashboardRoutes.js
│   ├── alertRoutes.js
│   └── contractorRoutes.js
├── utils/
│   ├── generateToken.js
│   └── riskCalculator.js
├── uploads/
├── .env.example
├── package.json
├── seed.js
├── server.js
└── README.md
```

---

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/coal_governance
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running locally or use MongoDB Atlas.

### 4. Seed Sample Data

```bash
npm run seed
```

### 5. Run Server

```bash
# Development
npm run dev

# Production
npm start
```

Server will start at: `http://localhost:5000`

---

## API Endpoints

### Auth
| Method | Endpoint              | Access   | Description          |
|--------|-----------------------|----------|----------------------|
| POST   | /api/auth/register    | Public   | Register user        |
| POST   | /api/auth/login       | Public   | Login                |
| GET    | /api/auth/me          | Private  | Get current user     |

### Mines
| Method | Endpoint         | Access             | Description     |
|--------|------------------|--------------------|-----------------|
| GET    | /api/mines       | Private            | List mines      |
| GET    | /api/mines/:id   | Private            | Get single mine |
| POST   | /api/mines       | Admin/Corporate    | Create mine     |
| PUT    | /api/mines/:id   | Admin/Corporate    | Update mine     |

### Inspections
| Method | Endpoint                              | Access  | Description              |
|--------|---------------------------------------|---------|--------------------------|
| GET    | /api/inspections                      | Private | List inspections         |
| GET    | /api/inspections/:id                  | Private | Get single inspection    |
| POST   | /api/inspections                      | Private | Create inspection        |
| PUT    | /api/inspections/:id                  | Private | Update / Close / Escalate|
| PATCH  | /api/inspections/:id/violations/:vid  | Private | Close specific violation |

### Compliances
| Method | Endpoint                 | Access  | Description          |
|--------|--------------------------|---------|----------------------|
| GET    | /api/compliances         | Private | List compliances     |
| GET    | /api/compliances/overdue | Private | Overdue list         |
| POST   | /api/compliances         | Private | Create               |
| PUT    | /api/compliances/:id     | Private | Update               |

### Dashboard
| Method | Endpoint                 | Access  | Description          |
|--------|--------------------------|---------|----------------------|
| GET    | /api/dashboard/summary   | Private | KPI summary          |
| GET    | /api/dashboard/analytics | Private | AI analytics data    |

### Alerts
| Method | Endpoint               | Access  | Description       |
|--------|------------------------|---------|-------------------|
| GET    | /api/alerts            | Private | Get alerts        |
| PATCH  | /api/alerts/:id/read   | Private | Mark as read      |
| PATCH  | /api/alerts/read-all   | Private | Mark all as read  |

### Contractors
| Method | Endpoint             | Access  | Description     |
|--------|----------------------|---------|-----------------|
| GET    | /api/contractors     | Private | List            |
| POST   | /api/contractors     | Private | Create          |
| PUT    | /api/contractors/:id | Private | Update          |

---

## Sample Login Credentials (after seeding)

| Role          | Email                    | Password  |
|---------------|--------------------------|-----------|
| Admin         | admin@cil.gov.in         | admin123  |
| Corporate     | corporate@cil.gov.in     | corp123   |
| Regulator     | regulator@dgms.gov.in    | reg123    |
| Mine Official | rajesh@ncl.gov.in        | mine123   |
| Mine Official | priya@ncl.gov.in         | mine123   |

---

## How to Test

1. Login → get JWT token
2. Use token in header: `Authorization: Bearer <token>`
3. Create inspection with coordinates → risk score is auto-calculated
4. Check `/api/dashboard/summary` and `/api/dashboard/analytics`

---

## Notes for SIH Demo

- Risk score is calculated using a rule-based engine (can be upgraded to ML later)
- Offline support: send `offlineId` when creating inspection
- Socket.io is ready – you can emit events from controllers for real-time dashboard
- All responses follow consistent format: `{ success, data, message? }`

---

**Good luck for Smart India Hackathon 2026!**
```