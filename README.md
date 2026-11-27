# ResumeIQ – MERN Resume Analyzer

Upload a resume (PDF / DOCX / TXT) and get an ATS score, skill extraction, job-description keyword match,
role-fit chart and improvement suggestions. Analyses are saved per user.

## Folder structure

```
resume-analyzer/
├── server/                    # Node + Express + MongoDB
│   ├── .env                   # copy from .env.example
│   ├── package.json
│   ├── server.js
│   ├── config/db.js
│   ├── models/{User,Analysis}.js
│   ├── middleware/{auth,upload}.js
│   ├── controllers/{authController,analysisController}.js
│   ├── routes/{authRoutes,analysisRoutes}.js
│   └── utils/{analyzer,extractText}.js
└── client/                    # React (Vite)
    ├── package.json, vite.config.js, index.html
    └── src/
        ├── main.jsx, App.jsx, api.js, index.css
        ├── context/AuthContext.jsx
        ├── components/{Navbar,ProtectedRoute,ScoreRing,UploadZone}.jsx
        └── pages/{Home,Auth,Analyze,Result,Dashboard}.jsx
```

## Run it

Prerequisites: Node 18+ and MongoDB running locally (or a MongoDB Atlas URI).

```bash
# Terminal 1 – backend
cd server
cp .env.example .env        # then edit JWT_SECRET (and MONGO_URI if using Atlas)
npm install
npm run dev                 # http://localhost:5000

# Terminal 2 – frontend
cd client
npm install
npm run dev                 # http://localhost:5173
```

The Vite dev server proxies `/api` to the backend, so no extra CORS setup is needed.
