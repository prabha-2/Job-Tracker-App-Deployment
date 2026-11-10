# ApplyTrack – Job Application Tracker

ApplyTrack is a cloud-deployed job application tracking application that helps users organize, manage, and monitor their job applications in one place.

## Screenshots

### Dashboard
[ApplyTrack Dashboard]<img width="1917" height="857" alt="image" src="https://github.com/user-attachments/assets/67cd7937-a8e4-4f4d-bcb7-a24e3c07a4a6" />



## Features

- View job application records.
- Add new job applications.
- Edit existing application details.
- Delete applications.
- Track application statuses:
  - Applied
  - Interview
  - Shortlisted
  - Offer
  - Rejected
- Store application data in Cloudflare D1.
- Connect frontend and backend through REST APIs.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Backend | Hono, TypeScript |
| Database | Cloudflare D1 (SQLite) |
| Frontend Hosting | Cloudflare Pages |
| Backend Hosting | Cloudflare Workers |
| CI/CD | GitHub Actions |
| Version Control | Git, GitHub |

## Architecture

```text
             User
              |
              v
      React Frontend
      (Cloudflare Pages)
              |
          REST API
              |
              v
       Hono Backend
     (Cloudflare Workers)
              |
              v
       Cloudflare D1
          Database
```

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Check backend health |
| GET | /api/applications | Retrieve all applications |
| POST | /api/applications | Add an application |
| PUT | /api/applications/:id | Update an application |
| DELETE | /api/applications/:id | Delete an application |

## Database

Cloudflare D1 is used as the application's persistent database.

The `applications` table stores:

- Company name
- Job role
- Application status
- Application date
- Job URL
- Notes

## Deployment and CI/CD

The application is deployed using Cloudflare Pages and Cloudflare Workers.

GitHub Actions automates the configured build and deployment workflow whenever changes are pushed to the repository.

Deployment workflow:

1. Push code changes to GitHub.
2. GitHub Actions triggers the configured workflow.
3. Frontend and backend build and deployment steps execute.
4. Cloudflare hosts the deployed application.

## Local Development

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd ApplyTrack
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

Open another terminal:

```bash
cd backend
npm install
npm run dev
```

Ensure your Cloudflare D1 database binding is configured correctly in the backend Wrangler configuration before running the backend.

## Deployment

The application was deployed using:

- Cloudflare Pages – Frontend hosting
- Cloudflare Workers – Backend API
- Cloudflare D1 – Database

Note: The live deployment has been taken offline. The source code and deployment configuration are available in this repository.

## Future Improvements

- User authentication and authorization.
- Search and filter applications.
- Application status analytics.
- Email notifications and reminders.
- Improved dashboard reporting.

---
