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
}

export default PacienteController;