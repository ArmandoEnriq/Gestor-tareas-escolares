const express = require("express");
const db = require("../config/db");
const verifyToken = require("../middlewares/authMiddleware");

const router = express.Router();

// CREAR TAREA (Solo para maestros)
router.post("/", verifyToken, (req, res) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { titulo, descripcion, fecha_limite } = req.body;

  db.query(
    "INSERT INTO tareas (titulo, descripcion, fecha_limite) VALUES (?, ?, ?)",
    [titulo, descripcion, fecha_limite],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear la tarea" });
      res.json({ message: "Tarea creada correctamente" });
    }
  );
});

// OBTENER TODAS LAS TAREAS (Todos los usuarios)
router.get("/", verifyToken, (req, res) => {
  db.query("SELECT * FROM tareas", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener tareas" });
    res.json(results);
  });
});

// OBTENER UNA TAREA POR ID
router.get("/:id", verifyToken, (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM tareas WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener la tarea" });
    if (results.length === 0) return res.status(404).json({ error: "Tarea no encontrada" });

    res.json(results[0]);
  });
});

// ACTUALIZAR UNA TAREA (Solo para maestros)
router.put("/:id", verifyToken, (req, res) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { id } = req.params;
  const { titulo, descripcion, fecha_limite } = req.body;

  db.query(
    "UPDATE tareas SET titulo = ?, descripcion = ?, fecha_limite = ? WHERE id = ?",
    [titulo, descripcion, fecha_limite, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al actualizar la tarea" });
      res.json({ message: "Tarea actualizada correctamente" });
    }
  );
});

// ELIMINAR UNA TAREA (Solo para maestros)
router.delete("/:id", verifyToken, (req, res) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({ error: "Acceso denegado" });
  }

  const { id } = req.params;

  db.query("DELETE FROM tareas WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: "Error al eliminar la tarea" });
    res.json({ message: "Tarea eliminada correctamente" });
  });
});

module.exports = router;
