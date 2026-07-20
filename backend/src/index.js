import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from '../db.js';

import PrestacionController from './controllers/PrestacionController.js';
import PacienteController from './controllers/PacienteController.js';
import RecursoController from './controllers/RecursoController.js';

import { prestacionRouter } from './routers/PrestacionRouter.js';
import { pacienteRouter } from './routers/PacienteRouter.js';
import { recursoRouter } from './routers/RecursoRouter.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const prestacionController = new PrestacionController(pool);
const pacienteController = new PacienteController(pool);
const recursoController = new RecursoController(pool);

app.use('/', prestacionRouter(prestacionController));
app.use('/', pacienteRouter(pacienteController));
app.use('/', recursoRouter(recursoController));

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