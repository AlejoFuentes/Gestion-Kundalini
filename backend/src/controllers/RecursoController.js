class RecursoController {
    constructor(pool) {
        this.pool = pool;
    }

    getRecursos = async (req, res) => {
        try {
            const resultado = await this.pool.query('SELECT * FROM recursos ORDER BY apellido ASC, nombre ASC');
            res.json(resultado.rows);
        } catch (error) {
            console.error('Error al traer los recursos:', error);
            res.status(500).json({ error: 'Hubo un problema al consultar la base de datos' });
        }
    };
}

export default RecursoController;