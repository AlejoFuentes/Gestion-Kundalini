import express from 'express';

export const pacienteRouter = (pacienteController) => {
    const router = express.Router();
    router.get('/pacientes', pacienteController.getPacientes);
    router.post('/pacientes', pacienteController.createPaciente);
    return router;
};