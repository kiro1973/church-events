# St. George Church Events Platform

A full-stack event ticketing system built for a church community.

## Tech Stack
- **Frontend:** React, TypeScript, Vite, Material UI
- **Backend:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Supabase) + Prisma ORM
- **Auth:** JWT + bcrypt
- **Email:** Resend
- **Images:** Cloudinary

## Features
- Visual seat map with real-time availability
- Atomic booking to prevent double booking race conditions
- Role-based access (User, Responsible, Admin)
- Guest booking with email confirmation
- 24h seat hold with automatic expiry
- Payment tracking (Instapay/Cash)
- Sponsor management with rotating banner

## Run Locally
# Backend
cd backend
cp .env.example .env  # fill in your credentials
npm install
npm run seed
npm run dev

# Frontend
cd frontend
npm install
npm run dev
