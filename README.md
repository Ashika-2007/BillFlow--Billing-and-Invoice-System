# Billing and Invoice System

A full-stack MERN billing platform for small and medium businesses. It includes JWT authentication, backend-enforced RBAC, client/product/invoice/payment management, server-side financial calculations, reports, notifications, invoice PDF generation, reminders, and BillBot with database-grounded fallback answers.

## Stack
- React + Vite + JavaScript
- React Router, Axios, Recharts, Lucide React, jsPDF
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Optional OpenAI-compatible AI provider on the backend only

## Structure
`server/` contains models, controllers, routes, services, middleware, seed data and utilities. `client/` contains the React application, reusable components, layouts, pages, context and API services.

## Requirements
- Node.js 18+
- MongoDB running locally

## Setup
1. Copy `server/.env.example` to `server/.env` and set `JWT_SECRET`. Optionally set `AI_API_KEY`.
2. Copy `client/.env.example` to `client/.env`.
3. Start MongoDB.
4. In `server`: `npm install`, then `npm run seed`, then `npm run dev`.
5. In `client`: `npm install`, then `npm run dev`.
6. Open http://localhost:5173.

## Demo credentials
- Admin: `admin@billing.com` / `Admin@123`
- Staff: `staff@billing.com` / `Staff@123`
- Client: `client@billing.com` / `Client@123`

## API overview
- `/api/auth/*` authentication
- `/api/clients/*` client management
- `/api/products/*` product/service management
- `/api/invoices/*` invoices and status refresh
- `/api/payments/*` payments
- `/api/dashboard/*` dashboard data
- `/api/reports/*` analytics
- `/api/notifications/*` notifications and reminders
- `/api/settings/*` tax and admin user controls
- `/api/chatbot/*` BillBot and history

## BillBot
The server first authenticates the user and role, queries MongoDB within the allowed scope, calculates billing values on the server, and then optionally sends verified data to the configured AI provider. If no AI provider is configured or it fails, structured billing logic answers common questions without fabricating numbers. No AI key is used by the React app.

## PDF
Invoice PDFs are generated client-side with jsPDF from the authenticated invoice details returned by the API. The invoice view also provides a print-friendly browser print action.

## Security notes
Never commit `.env`. Production deployments should use a strong JWT secret, HTTPS, restrictive CORS, rate limiting, secure cookie/token strategy as appropriate for the deployment model, and a production MongoDB deployment.

## Future enhancements
Email delivery, payment gateway integration, audit logs, recurring invoices, configurable company branding, scheduled background jobs, and richer AI intent classification can be added without changing the core architecture.
