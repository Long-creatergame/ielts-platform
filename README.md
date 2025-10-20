# IELTS Platform

A full-stack IELTS test platform built with Node.js, Express, MongoDB, React, Vite, and Tailwind CSS.

## Features

- User authentication (register/login) with JWT
- User management with trial/paid plans
- Test submission system
- Test history tracking
- Responsive design with Tailwind CSS

## Tech Stack

### Backend

- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

### Frontend

- React 18
- Vite
- React Router DOM
- Tailwind CSS
- Axios for API calls

## Project Structure

```
ielts-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Express middleware
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ielts-platform
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install client dependencies:

```bash
cd ../client
npm install
```

## Configuration

1. Create a `.env` file in the server directory:

```bash
cd server
cp .env.example .env
```

2. Update the `.env` file with your MongoDB connection string and Stripe keys:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ielts-platform
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
CLIENT_URL=http://localhost:5173
```

## Running the Application

### Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on port 4000.

### Start the Frontend Client

```bash
cd client
npm run dev
```

The client will start on port 5173.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Tests

- `GET /api/test/can-start` - Check if user can start a test (requires auth)
- `POST /api/test/submit` - Submit a test (requires auth)
- `GET /api/test/mine` - Get user's test history (requires auth)

### Payment

- `POST /api/payment/create-session` - Create Stripe checkout session (requires auth)
- `GET /api/payment/status` - Get payment status (requires auth)
- `POST /api/payment/webhook` - Stripe webhook handler

## User Model

```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  isTrialUsed: Boolean (default: false),
  plan: String ('trial' | 'paid', default: 'trial'),
  tests: [{
    skill: String,
    submittedAt: Date
  }]
}
```

## Pages

- `/login` - Login/Register page
- `/dashboard` - User dashboard with trial status and test history
- `/test/:skill` - Test page for specific skill (listening, reading, writing, speaking)
- `/payment-success` - Payment success page
- `/payment-cancel` - Payment cancellation page

## Development

The application uses:

- Vite for fast frontend development
- Nodemon for backend auto-reload
- Proxy configuration for API calls during development

## Production Deployment

1. Build the client:

```bash
cd client
npm run build
```

2. Start the server:

```bash
cd server
npm start
```

Make sure to set proper environment variables for production.

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe Dashboard
3. Set up a webhook endpoint pointing to `http://localhost:4000/api/payment/webhook`
4. Configure the webhook to listen for `checkout.session.completed` events
5. Copy the webhook signing secret to your `.env` file

### Testing Payments

Use Stripe's test card numbers:

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Payment Flow

1. User completes trial test
2. Dashboard shows "Upgrade to paid plan" button
3. Clicking button creates Stripe checkout session
4. User completes payment on Stripe checkout page
5. Stripe webhook updates user plan to "paid"
6. User redirected to success page and then dashboard
