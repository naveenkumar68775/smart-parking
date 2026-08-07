# Smart Parking Management System (MERN, MVC)

A production-grade Smart Parking Management System built with **React (Vite) + Tailwind CSS** on the frontend
and **Node.js/Express + MongoDB Atlas (Mongoose)** on the backend, using **MVC architecture** with
**Socket.IO** for real-time updates.

---

## Tech Stack

**Frontend:** React 18 (Vite), React Router DOM, Axios, Tailwind CSS, React Icons, Context API,
Socket.IO Client, Chart.js (react-chartjs-2), SweetAlert2, html5-qrcode (camera QR scanning).

**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT (access + refresh tokens), bcryptjs,
express-validator, Multer (avatar uploads), Nodemailer, Socket.IO, Morgan, dotenv, cookie-parser, CORS.

> **Note on scope:** Payments use a **mock gateway** (always succeeds for a valid amount) rather than a
> live Stripe/Razorpay integration, since that requires your own merchant API keys — swap the logic in
> `controllers/paymentController.js` for a real provider when you're ready to go live. Email sending
> **falls back to console-logging** the message if you haven't configured SMTP credentials in `.env`, so
> the app is fully runnable out of the box; add real SMTP creds to send actual emails. CSV export is fully
> implemented; PDF/Excel can be produced by opening the CSV in Excel/Sheets, or by wiring in `pdfkit` /
> `exceljs` server-side in `controllers/reportController.js` if you need native binary files.

---

## Project Structure

```
mern-smart-parking/
├── backend/
│   ├── config/         # db.js, socket.js, multer.js
│   ├── controllers/    # auth, user, vehicle, slot, booking, payment, qr, dashboard, notification, report, history
│   ├── middleware/      # auth (JWT + roles), errorHandler, validate
│   ├── models/          # User, Vehicle, Slot, Booking, Payment, Notification, ParkingHistory
│   ├── routes/           # one route file per controller
│   ├── seed/             # seedSlots.js, seedUsers.js, addCarSlots.js, makeAdmin.js
│   ├── uploads/           # avatar uploads land here
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/    # Navbar, Sidebar, ProtectedRoute, SlotCard
    │   ├── context/       # AuthContext, SocketContext, ThemeContext (dark/light mode)
    │   ├── layouts/       # MainLayout (navbar + sidebar shell)
    │   ├── pages/         # Landing, Login, Register, Forgot/ResetPassword, NotFound
    │   │   ├── user/       # Dashboard, LiveParking, BookSlot, MyBookings, BookingDetails,
    │   │   │               # Vehicles, Payments, Profile, History
    │   │   └── admin/      # AdminDashboard, ManageSlots, ManageUsers, ManageBookings, ScanQR, Reports
    │   ├── services/api.js # Axios instance with silent access-token refresh
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── .env.example
```

---

## 1. MongoDB Atlas Setup

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user and allow your IP (or `0.0.0.0/0` for local testing)
3. Copy the connection string, e.g.:
   `mongodb+srv://<user>:<password>@cluster0.mongodb.net/smart_parking`

(A local `mongod` instance also works — just use `mongodb://127.0.0.1:27017/smart_parking`.)

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, etc.
npm run dev        # http://localhost:5000, auto-reload via nodemon
```

### `.env` variables
| Variable | Description |
|---|---|
| `PORT` | Backend port (default 5000) |
| `MONGO_URI` | MongoDB Atlas (or local) connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random strings for signing tokens |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Token lifetimes (default `15m` / `7d`) |
| `CLIENT_URL` | Frontend origin, used for CORS + reset-password email links |
| `DEFAULT_HOURLY_RATE` | Fallback parking rate |
| `SMTP_*` | Optional; if blank, emails are logged to console instead of sent |

### Seeding demo data
```bash
npm run seed         # seeds a mixed set of Car/Bike/EV/VIP slots across 3 floors
npm run seed:users    # creates admin@smartparking.com / admin123 and user@smartparking.com / user1234
npm run seed:cars     # adds N car-only slots: node seed/addCarSlots.js --count=15
node seed/makeAdmin.js someone@example.com   # promote any existing user to admin
```

---

## 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:5000
npm run dev          # http://localhost:5173
```

---

## 4. Using the App

1. Run `npm run seed` and `npm run seed:users` in `backend/` to get demo slots + accounts.
2. Log in as `user@smartparking.com` / `user1234` — add a vehicle, book a slot, pay (mock gateway),
   and view your QR code on the Booking Details page.
3. Log in as `admin@smartparking.com` / `admin123` — see the analytics dashboard, manage slots/users/bookings,
   and use **Scan QR** (camera or manual Booking ID entry) to check vehicles in/out at the gate.
4. Live Parking and notifications update in real time via Socket.IO — try opening two browser tabs
   (one admin scanning, one user watching Live Parking) to see it react instantly.
5. Toggle dark/light mode from the sun/moon icon in the navbar.

---

## API Documentation

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <accessToken>`;
admin-only routes additionally require the logged-in user's role to be `admin`.

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register, returns access token + sets refresh cookie |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/refresh` | Public (cookie) | Exchange refresh cookie for new access token |
| POST | `/auth/logout` | Public | Clears refresh token |
| POST | `/auth/forgot-password` | Public | Emails a reset link (or logs it if SMTP unset) |
| POST | `/auth/reset-password/:token` | Public | Sets a new password |

### Users
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/users/profile` | Auth | Get own profile |
| PUT | `/users/profile` | Auth | Update name/phone/avatar url |
| PUT | `/users/change-password` | Auth | Change password |
| POST | `/users/avatar` | Auth | Upload avatar (multipart, field `avatar`) |
| GET | `/users` | Admin | List all users |
| PUT | `/users/:id/toggle-active` | Admin | Enable/disable a user |

### Vehicles
| Method | Endpoint | Access |
|---|---|---|
| GET/POST | `/vehicles` | Auth |
| PUT/DELETE | `/vehicles/:id` | Auth (owner only) |

### Slots
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/slots` | Auth | Live availability + summary counts |
| GET | `/slots/available` | Auth | Filter by `vehicleType`, `floor`, `section` |
| POST | `/slots` | Admin | Create a slot |
| POST | `/slots/seed` | Admin | Seed a demo mixed set (only if empty) |
| POST | `/slots/add-cars` | Admin | Bulk-add car slots (`count`, `floor`, `prefix`, ...) |
| PUT/DELETE | `/slots/:id` | Admin | Update (enable/disable/etc.) or delete |

### Bookings
| Method | Endpoint | Access |
|---|---|---|
| POST | `/bookings` | Auth — creates booking + QR code |
| GET | `/bookings/my` | Auth |
| GET | `/bookings` | Admin — supports `?status=` filter |
| GET | `/bookings/:id` | Auth (owner or admin) |
| PUT | `/bookings/:id/cancel` | Auth (owner or admin) |
| PUT | `/bookings/:id/extend` | Auth (owner) — extend expected exit time |
| PUT | `/bookings/:id/approve` | Admin |

### Payments
| Method | Endpoint | Access |
|---|---|---|
| POST | `/payments` | Auth — mock gateway charge |
| GET | `/payments/my` | Auth |
| GET | `/payments` | Admin |
| GET | `/payments/:id/invoice` | Auth (owner or admin) — HTML invoice, printable to PDF |

### QR (Entry/Exit)
| Method | Endpoint | Access |
|---|---|---|
| POST | `/qr/scan-entry` | Admin |
| POST | `/qr/scan-exit` | Admin — also writes a `ParkingHistory` record |

### Dashboard
| Method | Endpoint | Access |
|---|---|---|
| GET | `/dashboard/admin` | Admin — cards + monthly revenue/bookings, vehicle distribution, peak hours |
| GET | `/dashboard/user` | Auth — cards + booking history, monthly spending |

### Notifications
| Method | Endpoint | Access |
|---|---|---|
| GET | `/notifications` | Auth |
| PUT | `/notifications/:id/read` | Auth |
| PUT | `/notifications/read-all` | Auth |

### Reports
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/reports/search?query=` | Admin | Search by booking ID, vehicle no., slot no., or user name |
| GET | `/reports/bookings/filter` | Admin | Filter by `status`, `date`, `vehicleType`, `floor`, `section` |
| GET | `/reports/bookings/export?format=csv or json` | Admin | Download bookings report |
| GET | `/reports/payments/export?format=csv or json` | Admin | Download payments report |

### Parking History
| Method | Endpoint | Access |
|---|---|---|
| GET | `/history/my` | Auth |
| GET | `/history` | Admin |

---

## MongoDB Collections

`users`, `vehicles`, `slots`, `bookings`, `payments`, `notifications`, `parkinghistories`

Relationships: **User → many Vehicles/Bookings/Payments/Notifications/ParkingHistory**,
**Slot → many Bookings**, **Booking → one Payment (via booking ref)**,
**Booking → one ParkingHistory record (written on exit scan)**.

---

## Real-time Behavior (Socket.IO)

- `parking:update` is broadcast to all clients whenever a slot is created/updated/deleted or a booking
  changes slot status (reserve/occupy/free) — the **Live Parking** page listens for this and refetches.
- `notification:<userId>` is emitted privately to a specific user on booking confirmation, cancellation,
  payment success, and parking completion — the navbar bell badge updates instantly.

---

## Security Notes
- Passwords hashed with bcryptjs; access tokens are short-lived (15m) with a rotating refresh token stored
  as an httpOnly cookie.
- All mutating admin routes are protected by both `protect` (valid JWT) and `authorize('admin')` middleware.
- Input validation via `express-validator` on auth routes; extend the same pattern to other routes as needed.
- CORS is locked to `CLIENT_URL`; update this for your deployed frontend domain in production.
