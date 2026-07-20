import express from 'express';

export const recursoRouter = (recursoController) => {
    const router = express.Router();
    router.get('/recursos', recursoController.getRecursos);
    return router;
};
