import { obtenerRutaArchivo } from '../services/utils.js'

class RecursoController {
    constructor(pool) {
        this.pool = pool;
    }

    getRecursos = async (req, res) => {
        try {
            const resultado = await this.pool.query('SELECT * FROM recursos ORDER BY id DESC');
            res.json(resultado.rows);
        } catch (error) {
            console.error('Error al traer los recursos:', error);
            res.status(500).json({ error: 'Hubo un problema al consultar' });
        }
    };

    createRecurso = async (req, res) => {
        const es_monotributista = req.body.es_monotributista === 'true';
        
        const {
            nombre, apellido, dni, fecha_ingreso, telefono, direccion, especialidades
        } = req.body;

        const cv_url = req.files?.cv_url ? obtenerRutaArchivo(req.files.cv_url[0]) : null;
        const contrato_url = req.files?.contrato_url ? obtenerRutaArchivo(req.files.contrato_url[0]) : null;
        const titulos = req.files?.titulos ? req.files.titulos.map(obtenerRutaArchivo) : [];
        const certificados = req.files?.certificados ? req.files.certificados.map(obtenerRutaArchivo) : [];

        try {
            const query = `
                INSERT INTO recursos (
                    nombre, apellido, dni, fecha_ingreso, telefono, direccion, 
                    titulos, certificados, especialidades, cv_url, contrato_url, es_monotributista
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                ) RETURNING *;
            `;

            const limpiar = (val) => (val === undefined || val === null || String(val).trim() === '') ? null : val;

            const valores = [
                nombre, apellido, dni, fecha_ingreso, telefono, direccion,
                titulos, certificados, especialidades, cv_url, contrato_url, es_monotributista
            ].map(limpiar);

            const resultado = await this.pool.query(query, valores);

            res.status(201).json({ mensaje: 'Recurso creado', recurso: resultado.rows[0] });

        } catch (error) {
            console.error('Error al crear el recurso:', error);
            res.status(500).json({ error: 'Hubo un problema al guardar en la BD' });
        }
    };

    updateRecurso = async (req, res) => {
        const { id } = req.params;
        const es_monotributista = req.body.es_monotributista === 'true' || req.body.es_monotributista === true;
        const { nombre, apellido, dni, fecha_ingreso, telefono, direccion, especialidades } = req.body;

        const titulos_viejos = req.body.titulos_viejos ? JSON.parse(req.body.titulos_viejos) : [];
        const certificados_viejos = req.body.certificados_viejos ? JSON.parse(req.body.certificados_viejos) : [];
        const cv_url_viejo = req.body.cv_url_viejo && req.body.cv_url_viejo !== '' ? req.body.cv_url_viejo : null;
        const contrato_url_viejo = req.body.contrato_url_viejo && req.body.contrato_url_viejo !== '' ? req.body.contrato_url_viejo : null;

        const cv_url_nuevo = req.files?.cv_url ? obtenerRutaArchivo(req.files.cv_url[0]) : null;
        const contrato_url_nuevo = req.files?.contrato_url ? obtenerRutaArchivo(req.files.contrato_url[0]) : null;
        const titulos_nuevos = req.files?.titulos ? req.files.titulos.map(obtenerRutaArchivo) : [];
        const certificados_nuevos = req.files?.certificados ? req.files.certificados.map(obtenerRutaArchivo) : [];

        const cv_url_final = cv_url_nuevo || cv_url_viejo;
        const contrato_url_final = contrato_url_nuevo || contrato_url_viejo;
        const titulos_finales = [...titulos_viejos, ...titulos_nuevos];
        const certificados_finales = [...certificados_viejos, ...certificados_nuevos];

        try {
            const query = `
                UPDATE recursos 
                SET 
                    nombre = COALESCE($1, nombre), 
                    apellido = COALESCE($2, apellido), 
                    dni = COALESCE($3, dni), 
                    fecha_ingreso = COALESCE($4, fecha_ingreso), 
                    telefono = COALESCE($5, telefono), 
                    direccion = COALESCE($6, direccion), 
                    titulos = $7, 
                    certificados = $8, 
                    especialidades = COALESCE($9, especialidades), 
                    cv_url = $10, 
                    contrato_url = $11, 
                    es_monotributista = COALESCE($12, es_monotributista)
                WHERE id = $13
                RETURNING *;
            `;

            const valores = [
                nombre, apellido, dni, fecha_ingreso, telefono, direccion,
                titulos_finales, certificados_finales, especialidades, cv_url_final, contrato_url_final, es_monotributista,
                id
            ];

            const resultado = await this.pool.query(query, valores);

            if (resultado.rowCount === 0) {
                return res.status(404).json({ error: 'Recurso no encontrado' });
            }

            res.status(200).json({ mensaje: 'Recurso actualizado', recurso: resultado.rows[0] });

        } catch (error) {
            console.error('Error al editar el recurso:', error);
            res.status(500).json({ error: 'Hubo un problema al actualizar en la BD' });
        }
    };
    
    deleteRecurso = async (req, res) => {
        const { id } = req.params;
        try {
            const resultado = await this.pool.query('DELETE FROM recursos WHERE id = $1 RETURNING *;', [id]);
            if (resultado.rowCount === 0) {
                return res.status(404).json({ error: 'Recurso no encontrado' });
            }
            res.status(200).json({ mensaje: 'Recurso eliminado con éxito' });
        } catch (error) {
            console.error('Error al eliminar el recurso:', error);
            res.status(500).json({ error: 'Hubo un problema al eliminar de la BD' });
        }
    };
}

export default RecursoController;