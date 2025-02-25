require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const respuestasRoutes = require("./routes/respuestasRoutes");


const app = express();
app.use(express.json());
app.use(cors());


app.use("/api/auth", authRoutes);

app.use("/api/tareas", taskRoutes);

app.use("/api/respuestas", respuestasRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
