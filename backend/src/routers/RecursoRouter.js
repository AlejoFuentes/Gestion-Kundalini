import express from 'express';
import { upload } from '../services/multer.js'; 

export const recursoRouter = (recursoController) => {
    const router = express.Router();
    
    router.get('/recursos', recursoController.getRecursos);
    
    const subidaDeArchivos = upload.fields([
        { name: 'cv_url', maxCount: 1 },
        { name: 'contrato_url', maxCount: 1 },
        { name: 'titulos', maxCount: 5 },
        { name: 'certificados', maxCount: 5 }
    ]);

    router.post('/recursos', subidaDeArchivos, recursoController.createRecurso);
    router.put('/recursos/:id', subidaDeArchivos, recursoController.updateRecurso);
    router.delete('/recursos/:id', recursoController.deleteRecurso);
    
    return router;
};
