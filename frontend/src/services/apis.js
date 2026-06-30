import Axios from 'axios'; 

const url = 'http://localhost:3000'; //'https://tilt-disperser-clamshell.ngrok-free.dev'; //  

export const obtenerMovimientos = () => {
    return Axios.get(`${url}/caja`);
}

export const obtenerPrestaciones = () => {
    return Axios.get(`${url}/prestaciones`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
        .then(respuesta => {
            return respuesta.data; 
        })
        .catch(error => {
            console.error("Error al traer las prestaciones:", error);
            return [];
        });
}

export const prestacionEdit = (id, datos) => {
    return Axios.put(`${url}/prestaciones/${id}`, datos, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al editar la prestacion:", error);
        throw error;
    });
}