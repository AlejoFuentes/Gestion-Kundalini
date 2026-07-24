import { Router } from 'express';

export const especialidadRouter = (controller) => {
    const router = Router();

    router.get('/especialidades', controller.obtenerEspecialidades);
    router.post('/especialidades', controller.crearEspecialidad);
    router.delete('/especialidades/:id', controller.eliminarEspecialidad);

    return router;
};