// app.js
// require('dotenv').config();
// require('dotenv').config({ path: './.env' });

const express = require('express');
const app = express();
const orderRoutes = require('./routes/get_order');
const menuRoutes = require('./routes/manage_menu');
const authRoutes = require('./routes/auth');
const jwt = require('jsonwebtoken');

app.use(express.json()); // 使用 express.json() 中介軟體
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors()); // 允許來自所有來源的請求

// app.use(express.static('public')); // 提供靜態檔案

app.use('/api/orders', orderRoutes);
app.use('/api/menu-management', menuRoutes);
app.use('/api/auth', authRoutes);

// 設定伺服器監聽的端口
const PORT = process.env.PORT || 3000; // 可以使用環境變數或預設為 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
