import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from '../db.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));
app.use(express.json());

app.get('/caja', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM caja ORDER BY fecha DESC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al traer la caja:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
    }
});

app.get('/prestaciones', async (req, res) => {
    try {
        const query = `
            SELECT 
                pr.*, 
                row_to_json(pa) AS paciente
            FROM prestaciones pr
            INNER JOIN pacientes pa ON pr.paciente_id = pa.id
        `;
        
        const resultado = await pool.query(query);
        res.json(resultado.rows);
        
    } catch (error) {
        console.error('Error al traer las prestaciones con JOIN completo:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
    }
});

app.post('/prestaciones', async (req, res) => {
    const {
        paciente_id,
        fecha_inicio, 
        fecha_fin, 
        especialidad, 
        frecuencia, 
        cantidad, 
        valor, 
        total, 
        observaciones, 
        detalles_extras, 
        pagado, 
        prestador,
        horario,
        estado
    } = req.body;

    const limpiar = (val) => (val === undefined || val === null || String(val).trim() === '') ? null : val;

    try {
        const query = `
            INSERT INTO prestaciones (
                paciente_id, fecha_inicio, fecha_fin, especialidad, frecuencia, 
                cantidad, valor, total, observaciones, detalles_extras, 
                pagado, prestador, horario, estado
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14
            ) RETURNING *;
        `;

        const valores = [
            paciente_id,
            fecha_inicio,
            fecha_fin,
            especialidad,
            frecuencia,
            cantidad ? parseInt(cantidad) : 0,
            valor ? parseInt(valor) : 0,
            total ? parseInt(total) : 0,
            observaciones,
            JSON.stringify(detalles_extras || {}), 
            pagado === 'true' || pagado === true, 
            prestador,
            horario,
            estado || 'Sin asignar'
        ].map(limpiar);

        const resultado = await pool.query(query, valores);

        res.status(201).json({ 
            mensaje: 'Prestación creada con éxito', 
            prestacion: resultado.rows[0] 
        });

    } catch (error) {
        console.error('Error al crear la prestación:', error);
        res.status(500).json({ error: 'Hubo un problema al guardar en la base de datos' });
    }
});

app.put('/prestaciones/:id', async (req, res) => {
    const { id } = req.params;
    
    const {
        fecha_inicio, 
        fecha_fin, 
        especialidad, 
        frecuencia, 
        cantidad, 
        valor, 
        total, 
        observaciones, 
        detalles_extras, 
        pagado, 
        prestador,
        horario,
        estado
    } = req.body;

    const limpiar = (val) => (val === undefined || val === null || String(val).trim() === '') ? null : val;

    try {
        const query = `
            UPDATE prestaciones 
            SET 
                fecha_inicio = $1,
                fecha_fin = $2,
                especialidad = $3,
                frecuencia = $4,
                cantidad = $5,
                valor = $6,
                total = $7,
                observaciones = $8,
                detalles_extras = $9::jsonb,
                pagado = $10,
                prestador = $11,
                horario = $12,
                estado = $13
            WHERE id = $14
            RETURNING *;
        `;

        const valores = [
            fecha_inicio,
            fecha_fin,
            especialidad,
            frecuencia,
            cantidad,
            valor,
            total,
            observaciones,
            JSON.stringify(detalles_extras || {}), 
            pagado === 'true' || pagado === true, 
            prestador,
            horario,
            estado || 'Sin asignar',
            id
        ].map(limpiar);

        const resultado = await pool.query(query, valores);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Prestación no encontrada' });
        }

        res.json({ 
            mensaje: 'Prestación actualizada con éxito', 
            prestacion: resultado.rows[0] 
        });

    } catch (error) {
        console.error('Error al actualizar la prestación:', error);
        res.status(500).json({ error: 'Hubo un problema al actualizar la base de datos' });
    }
});

app.delete('/prestaciones/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM prestaciones WHERE id = $1 RETURNING *';
        const resultado = await pool.query(query, [id]);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ error: 'Prestación no encontrada' });
        }

        res.json({ 
            mensaje: 'Prestación eliminada con éxito', 
            prestacion: resultado.rows[0] 
        });

    } catch (error) {
        console.error('Error al eliminar la prestación:', error.message);
        res.status(500).json({ error: 'Hubo un problema al eliminar en la base de datos' });
    }
});

app.get('/pacientes', async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM pacientes ORDER BY apellido ASC, nombre ASC');
        res.json(resultado.rows);
    } catch (error) {
        console.error('Error al traer los pacientes:', error);
        res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});