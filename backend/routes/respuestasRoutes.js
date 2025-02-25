const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middlewares/authMiddleware");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Configuración de Multer para guardar archivos en "uploads/"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// SUBIR RESPUESTA (Solo para alumnos)
router.post("/:tarea_id", verifyToken, upload.single("archivo"), (req, res) => {
  if (req.user.rol !== "usuario") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { tarea_id } = req.params;
  const archivo = req.file ? req.file.filename : null;

  db.query(
    "INSERT INTO respuestas (usuario_id, tarea_id, archivo) VALUES (?, ?, ?)",
    [req.user.id, tarea_id, archivo],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al subir la respuesta" });
      res.json({ message: "Respuesta enviada correctamente" });
    }
  );
});

// OBTENER RESPUESTAS DE UNA TAREA (Solo para maestros)
router.get("/:tarea_id", verifyToken, (req, res) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { tarea_id } = req.params;

  db.query(
    "SELECT r.id, u.nombre AS alumno, r.archivo, r.fecha_envio FROM respuestas r JOIN usuarios u ON r.usuario_id = u.id WHERE r.tarea_id = ?",
    [tarea_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error al obtener respuestas" });
      res.json(results);
    }
  );
});

// CALIFICAR RESPUESTA (Solo para maestros)
router.put("/calificar/:respuesta_id", verifyToken, (req, res) => {
    if (req.user.rol !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
  
    const { respuesta_id } = req.params;
    const { calificacion, comentario } = req.body;
  
    db.query(
      "UPDATE respuestas SET calificacion = ?, comentario = ? WHERE id = ?",
      [calificacion, comentario, respuesta_id],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Error al calificar la respuesta" });
        res.json({ message: "Respuesta calificada correctamente" });
      }
    );
  });
  
  // OBTENER RESPUESTA CON CALIFICACIÓN
  router.get("/detalle/:respuesta_id", verifyToken, (req, res) => {
    const { respuesta_id } = req.params;
  
    db.query(
      "SELECT r.id, u.nombre AS alumno, r.archivo, r.fecha_envio, r.calificacion, r.comentario FROM respuestas r JOIN usuarios u ON r.usuario_id = u.id WHERE r.id = ?",
      [respuesta_id],
      (err, results) => {
        if (err) return res.status(500).json({ error: "Error al obtener la respuesta" });
        if (results.length === 0) return res.status(404).json({ error: "Respuesta no encontrada" });
  
        res.json(results[0]);
      }
    );
  });
  

module.exports = router;
