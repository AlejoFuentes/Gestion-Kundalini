import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
    res.json({ mensaje: '¡El backend de Kundalini está vivo y usando import/export! 🚀' });
});

app.get('/caja', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM caja ORDER BY fecha DESC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al traer la caja:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});