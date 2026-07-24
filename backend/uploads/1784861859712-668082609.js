export default class EspecialidadController {
    constructor(pool) {
        this.pool = pool;
    }

    obtenerEspecialidades = async (req, res) => {
        try {
            const resultado = await this.pool.query('SELECT * FROM especialidades ORDER BY nombre ASC');
            res.status(200).json(resultado.rows);
        } catch (error) {
            console.error('Error al obtener especialidades:', error);
            res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
        }
    };

    crearEspecialidad = async (req, res) => {
        const { nombre } = req.body;
        if (!nombre || nombre.trim() === '') {
            return res.status(400).json({ error: 'El nombre de la especialidad es obligatorio' });
        }

        try {
            const query = 'INSERT INTO especialidades (nombre) VALUES ($1) RETURNING *;';
            const resultado = await this.pool.query(query, [nombre.trim()]);
            res.status(201).json({ mensaje: 'Especialidad creada con éxito', especialidad: resultado.rows[0] });
        } catch (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Esa especialidad ya existe' });
            }
            console.error('Error al crear especialidad:', error);
            res.status(500).json({ error: 'Hubo un problema al guardar en la base de datos' });
        }
    };

    eliminarEspecialidad = async (req, res) => {
        const { id } = req.params;
        try {
            const resultado = await this.pool.query('DELETE FROM especialidades WHERE id = $1 RETURNING *;', [id]);
            if (resultado.rowCount === 0) {
                return res.status(404).json({ error: 'Especialidad no encontrada' });
            }
            res.status(200).json({ mensaje: 'Especialidad eliminada con éxito' });
        } catch (error) {
            console.error('Error al eliminar especialidad:', error);
            res.status(500).json({ error: 'Hubo un problema al eliminar de la base de datos' });
        }
    };
}