import Axios from 'axios';

const url = 'http://localhost:3000'

export const obtenerMovimientos = () => {
    return Axios.get(`${url}/caja`);
}

export const obtenerPrestaciones = () => {
    return Axios.get(`${url}/prestaciones`)
        .then(respuesta => {
            return respuesta.data; 
        })
        .catch(error => {
            console.error("Error al traer las prestaciones:", error);
            return [];
        });
}
