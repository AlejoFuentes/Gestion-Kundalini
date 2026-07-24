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
                    (
                        SELECT COALESCE(json_agg(json_build_object('id', r.id, 'nombre', r.nombre || ' ' || r.apellido)), '[]')
                        FROM recursos r
                        WHERE r.id = ANY(COALESCE(pr.recurso, ARRAY[]::integer[]))
                    ) AS recurso
                FROM prestaciones pr
                INNER JOIN pacientes pa ON pr.paciente_id = pa.id
                ORDER BY pr.id DESC
            `;
            
            const resultado = await this.pool.query(query);
            res.json(resultado.rows);
            
        } catch (error) {
            console.error('Error al traer las prestaciones:', error);
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
            observaciones, 
            detalles_extras, 
            pagado, 
            prestador,
            horario,
            estado,
            recurso 
        } = req.body;

        const cantNum = cantidad ? parseFloat(cantidad) : 0;
        const valNum = valor ? parseFloat(valor) : 0;
        const totalCalculado = cantNum * valNum;

        let recursoArray = [];
        if (recurso) {
            if (Array.isArray(recurso)) {
                recursoArray = recurso.map(id => parseInt(id, 10)).filter(n => !isNaN(n));
            } else {
                const parsed = parseInt(recurso, 10);
                if (!isNaN(parsed)) recursoArray = [parsed];
            }
        }

        try {
            const query = `
                INSERT INTO prestaciones (
                    paciente_id, fecha_inicio, fecha_fin, especialidad, frecuencia, 
                    cantidad, valor, total, observaciones, detalles_extras, 
                    pagado, prestador, horario, estado, recurso
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, $14, $15
                ) RETURNING *;
            `;

            const valores = [
                paciente_id,
                fecha_inicio,
                fecha_fin,
                especialidad,
                frecuencia,
                cantNum,
                valNum,
                totalCalculado, 
                observaciones,
                JSON.stringify(detalles_extras || {}), 
                pagado === 'true' || pagado === true, 
                prestador,
                horario,
                estado || 'Sin asignar',
                recursoArray
            ].map(limpiar);

            valores[14] = recursoArray;

            const resultado = await this.pool.query(query, valores);
            const nuevaPrestacion = resultado.rows[0];

            if (recursoArray.length > 0) {
                const recursosQuery = `SELECT id, nombre || ' ' || apellido AS nombre FROM recursos WHERE id = ANY($1)`;
                const recursosRes = await this.pool.query(recursosQuery, [recursoArray]);
                nuevaPrestacion.recurso = recursosRes.rows;
            } else {
                nuevaPrestacion.recurso = [];
            }

            // Consultar datos completos del paciente para devolverlos en la respuesta
            const pacienteQuery = `SELECT * FROM pacientes WHERE id = $1`;
            const pacienteRes = await this.pool.query(pacienteQuery, [paciente_id]);
            nuevaPrestacion.paciente = pacienteRes.rows[0] || null;

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
            paciente_id, // Añadido para capturar el cambio de paciente
            fecha_inicio, 
            fecha_fin, 
            especialidad, 
            frecuencia, 
            cantidad, 
            valor, 
            observaciones, 
            detalles_extras, 
            pagado, 
            prestador,
            horario,
            estado,
            recurso 
        } = req.body;

        const cantNum = cantidad ? parseFloat(cantidad) : 0;
        const valNum = valor ? parseFloat(valor) : 0;
        const totalCalculado = cantNum * valNum;

        let recursoArray = [];
        if (recurso) {
            if (Array.isArray(recurso)) {
                recursoArray = recurso.map(item => parseInt(typeof item === 'object' ? item.id : item, 10)).filter(n => !isNaN(n));
            } else {
                const parsed = parseInt(recurso, 10);
                if (!isNaN(parsed)) recursoArray = [parsed];
            }
        }

        try {
            const query = `
                UPDATE prestaciones 
                SET 
                    paciente_id = $1,
                    fecha_inicio = $2,
                    fecha_fin = $3,
                    especialidad = $4,
                    frecuencia = $5,
                    cantidad = $6,
                    valor = $7,
                    total = $8,
                    observaciones = $9,
                    detalles_extras = $10::jsonb,
                    pagado = $11,
                    prestador = $12,
                    horario = $13,
                    estado = $14,
                    recurso = $15
                WHERE id = $16
                RETURNING *;
            `;

            const valores = [
                paciente_id,
                fecha_inicio,
                fecha_fin,
                especialidad,
                frecuencia,
                cantNum,
                valNum,
                totalCalculado, 
                observaciones,
                JSON.stringify(detalles_extras || {}), 
                pagado === 'true' || pagado === true, 
                prestador,
                horario,
                estado || 'Sin asignar',
                recursoArray,
                id
            ].map(limpiar);

            valores[14] = recursoArray;

            const resultado = await this.pool.query(query, valores);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ error: 'Prestación no encontrada' });
            }

            const prestacionActualizada = resultado.rows[0];
            
            // Asignar los objetos de recursos formateados
            if (recursoArray.length > 0) {
                const recursosQuery = `SELECT id, nombre || ' ' || apellido AS nombre FROM recursos WHERE id = ANY($1)`;
                const recursosRes = await this.pool.query(recursosQuery, [recursoArray]);
                prestacionActualizada.recurso = recursosRes.rows;
            } else {
                prestacionActualizada.recurso = [];
            }

            // Consultar datos completos del paciente actualizado
            const pacienteQuery = `SELECT * FROM pacientes WHERE id = $1`;
            const pacienteRes = await this.pool.query(pacienteQuery, [prestacionActualizada.paciente_id]);
            prestacionActualizada.paciente = pacienteRes.rows[0] || null;

            res.json({ 
                mensaje: 'Prestación actualizada con éxito', 
                prestacion: prestacionActualizada 
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