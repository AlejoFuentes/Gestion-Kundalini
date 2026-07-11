import express from 'express';

export const prestacionRouter = (prestacionController) => {
    const router = express.Router();
    router.get('/prestaciones', prestacionController.getPrestaciones);
    router.post('/prestaciones', prestacionController.createPrestacion);
    router.put('/prestaciones/:id', prestacionController.updatePrestacion);
    router.delete('/prestaciones/:id', prestacionController.deletePrestacion);
    return router;
};