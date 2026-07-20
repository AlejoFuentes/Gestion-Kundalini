import { limpiar } from '../services/utils.js';

class PacienteController {
    constructor(pool) {
        this.pool = pool;
    }

    getPacientes = async (req, res) => {
        try {
            const resultado = await this.pool.query('SELECT * FROM pacientes ORDER BY apellido ASC, nombre ASC');
            res.json(resultado.rows);
        } catch (error) {
            console.error('Error al traer los pacientes:', error);
            res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
        }
    };
    
    createPaciente = async (req, res) => {
        const {
            nombre,
            apellido,
            dni,
            fecha_nacimiento,
            direccion,
            localidad,
            telefono,
            email,
            diagnostico,
            obra_social,
            numero_afiliado,
            observaciones
        } = req.body; 

        try {
            const query = `
                INSERT INTO pacientes (
                    nombre, apellido, dni, fecha_nacimiento, direccion, 
                    localidad, telefono, email, diagnostico, obra_social, 
                    numero_afiliado, observaciones
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                ) RETURNING *;
            `;

            const valores = [
                nombre,
                apellido,
                dni,
                fecha_nacimiento,
                direccion,
                localidad,
                telefono,
                email,
                diagnostico,
                obra_social,
                numero_afiliado,
                observaciones
            ].map(limpiar);

            const resultado = await this.pool.query(query, valores);

            res.status(201).json({ 
                mensaje: 'Paciente creado con éxito', 
                paciente: resultado.rows[0] 
            });

        } catch (error) {
            console.error('Error al crear el paciente:', error);
            res.status(500).json({ error: 'Hubo un problema al guardar en la base de datos' });
        }
    };
    
    updatePaciente = async (req, res) => {
        const { id } = req.params;
        const {
            nombre,
            apellido,
            dni,
            fecha_nacimiento,
            direccion,
            localidad,
            telefono,
            email,
            diagnostico,
            obra_social,
            numero_afiliado,
            observaciones
        } = req.body; 

        try {
            const query = `
                UPDATE pacientes 
                SET 
                    nombre = $1, apellido = $2, dni = $3, fecha_nacimiento = $4, 
                    direccion = $5, localidad = $6, telefono = $7, email = $8, 
                    diagnostico = $9, obra_social = $10, numero_afiliado = $11, 
                    observaciones = $12
                WHERE id = $13
                RETURNING *;
            `;

            const valores = [
                nombre,
                apellido,
                dni,
                fecha_nacimiento,
                direccion,
                localidad,
                telefono,
                email,
                diagnostico,
                obra_social,
                numero_afiliado,
                observaciones,
                id
            ].map(limpiar);

            const resultado = await this.pool.query(query, valores);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente no encontrado' });
            }

            res.json({ 
                mensaje: 'Paciente actualizado con éxito', 
                paciente: resultado.rows[0] 
            });

        } catch (error) {
            console.error('Error al actualizar el paciente:', error);
            res.status(500).json({ error: 'Hubo un problema al actualizar en la base de datos' });
        }
    };
    
    deletePaciente = async (req, res) => {
        const { id } = req.params;

        try {
            const query = 'DELETE FROM pacientes WHERE id = $1 RETURNING *';
            const resultado = await this.pool.query(query, [id]);

            if (resultado.rows.length === 0) {
                return res.status(404).json({ error: 'Paciente no encontrado' });
            }

            res.json({ 
                mensaje: 'Paciente eliminado con éxito', 
                paciente: resultado.rows[0] 
            });

        } catch (error) {
            console.error('Error al eliminar el paciente:', error.message);
            res.status(500).json({ error: 'Hubo un problema al eliminar en la base de datos' });
        }
    };
}

export default PacienteController;