require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const fs = require('fs');
const path = require('path');

// Ensure uploaded payment QR code is copied to public assets
const uploadedQrPath = 'C:\\Users\\navee\\.gemini\\antigravity-ide\\brain\\780c2f1e-823e-4b30-b8dc-7b13f236c3df\\media__1786096287905.jpg';
const publicQrPath = path.join(__dirname, '../frontend/public/payment-qr.png');
const uploadsQrPath = path.join(__dirname, 'uploads/payment-qr.png');
if (fs.existsSync(uploadedQrPath)) {
  try {
    fs.mkdirSync(path.dirname(publicQrPath), { recursive: true });
    fs.mkdirSync(path.dirname(uploadsQrPath), { recursive: true });
    fs.copyFileSync(uploadedQrPath, publicQrPath);
    fs.copyFileSync(uploadedQrPath, uploadsQrPath);
    console.log('[Payment System] Uploaded Payment QR code copied successfully.');
  } catch (err) {
    console.error('[Payment System] Failed to copy QR image:', err.message);
  }
}
const { errorHandler, notFound } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const qrRoutes = require('./routes/qrRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const historyRoutes = require('./routes/historyRoutes');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: CLIENT_URL, credentials: true },
});
initSocket(io);

connectDB();

// Middleware
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/history', historyRoutes);

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Smart Parking Management API is running' });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
