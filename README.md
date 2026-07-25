# Expense Management App

A full-stack personal expense tracker: a React Native (Expo) mobile app backed by a Node.js/Express + MongoDB API.

## Tech Stack

- **Frontend**: React Native, Expo, NativeWind (Tailwind for RN), React Navigation
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT auth, Joi validation

## Features

- Email/password authentication (JWT)
- Add, edit, and delete income/expense transactions with title, amount, category, date, and notes
- Recent transactions on the home dashboard
- History with search, type/category filters, date-range presets, and sorting
- Statistics with a month selector and income/expense category breakdowns
- Dark mode and multi-currency display
- CSV export of transactions
- Rate-limited auth endpoints, per-user data isolation, indexed queries

## Project Structure

```
backend/    Express API (routes, controllers, models, validators, tests)
frontend/   Expo app (screens, components, contexts, services)
```

## Prerequisites

- Node.js and npm
- A MongoDB connection string (local instance or MongoDB Atlas)
- [Expo Go](https://expo.dev/go) on a phone, or an Android/iOS emulator, for testing on mobile

## Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
```

Run it:

```bash
npm run dev     # starts with nodemon on http://localhost:5000
npm test        # runs the Jest test suite
```

## Frontend Setup

```bash
cd frontend
npm install
```

`frontend/.env` sets the API host the app talks to:

```
EXPO_PUBLIC_API_HOST=http://<your-machine-LAN-IP>:5000
```

Use your machine's LAN IP (not `localhost`) if you're testing on a physical device over Wi-Fi via Expo Go; `localhost` works fine for the web build or an emulator on the same machine.

Run it:

```bash
npx expo start          # prints a QR code — scan with Expo Go, or press a/i for an emulator
npx expo start --web    # opens the app in a regular browser tab
npm run lint            # ESLint
```

## API Overview

All `/api/expenses` routes require `Authorization: Bearer <token>` from `/api/auth/login` or `/api/auth/register`.

| Method | Route                | Description                                      |
| ------ | --------------------- | ------------------------------------------------ |
| POST   | `/api/auth/register`  | Create an account                                 |
| POST   | `/api/auth/login`     | Log in, returns a JWT                             |
| GET    | `/api/expenses`       | List expenses (supports `page`, `limit`, `type`, `category`, `search`, `startDate`, `endDate`, `sort`) |
| POST   | `/api/expenses`       | Create an expense                                 |
| GET    | `/api/expenses/:id`   | Get one expense                                   |
| PUT    | `/api/expenses/:id`   | Update an expense                                 |
| DELETE | `/api/expenses/:id`   | Delete an expense                                 |
