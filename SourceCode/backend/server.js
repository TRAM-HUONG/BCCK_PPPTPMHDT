const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const ctdtRoutes = require('./routes/ctdtRoutes');
const planRoutes = require('./routes/planRoutes');
const simulationRoutes = require('./routes/simulationRoutes'); 
// backend/server.js (Bổ sung route cố vấn học tập)
const advisorRoutes = require('./routes/advisorRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const ctdtAdminRoutes = require('./routes/ctdtAdminRoutes');
const prerequisiteRoutes = require('./routes/prerequisiteRoutes');
const adminGradeRoutes = require('./routes/adminGradeRoutes');
// ...


const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/ctdt', ctdtRoutes);
app.use('/api/plan', planRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/advisor', advisorRoutes);

app.use('/api/admin', adminRoutes); 
app.use('/api/admin/ctdt', ctdtAdminRoutes);
app.use('/api/admin/prerequisites', prerequisiteRoutes);
app.use('/api/admin/grades', adminGradeRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});