import { limpiar } from '../services/utils.js';

class PrestacionController {
    constructor(pool) {
        this.pool = pool;
    }

    getPrestaciones = async (req, res) => {
        try {
            const query = `
                SELECT 
                    pr.*, 
                    row_to_json(pa) AS paciente,
                    pp.profesional AS recurso
                FROM prestaciones pr
                INNER JOIN pacientes pa ON pr.paciente_id = pa.id
                LEFT JOIN prestaciones_profesionales pp ON pr.id = pp.prestacion_id
            `;
            
            const resultado = await this.pool.query(query);
            res.json(resultado.rows);
            
        } catch (error) {
            console.error('Error al traer las prestaciones con JOIN completo:', error);
            res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
        }
    };

    createPrestacion = async (req, res) => {
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
            estado,
            recurso 
        } = req.body;

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

            const resultado = await this.pool.query(query, valores);
            const nuevaPrestacion = resultado.rows[0];

            if (recurso && recurso.trim() !== '') {
                const queryProfesional = `
                    INSERT INTO prestaciones_profesionales (prestacion_id, profesional)
                    VALUES ($1, $2)
                `;
                await this.pool.query(queryProfesional, [nuevaPrestacion.id, recurso]);
                
                nuevaPrestacion.recurso = recurso;
            }

            res.status(201).json({ 
                mensaje: 'Prestación creada con éxito', 
                prestacion: nuevaPrestacion 
            });

        } catch (error) {
            console.error('Error al crear la prestación:', error);
            res.status(500).json({ error: 'Hubo un problema al guardar en la base de datos' });
        }
    };

    updatePrestacion = async (req, res) => {
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

            const resultado = await this.pool.query(query, valores);

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
    };

    deletePrestacion = async (req, res) => {
        const { id } = req.params;

        try {
            const query = 'DELETE FROM prestaciones WHERE id = $1 RETURNING *';
            const resultado = await this.pool.query(query, [id]);

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
    };
}

export default PrestacionController;