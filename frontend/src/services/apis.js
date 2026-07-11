import Axios from 'axios'; 

const url = 'http://localhost:3000'; //'https://tilt-disperser-clamshell.ngrok-free.dev'; //  

export const obtenerMovimientos = () => {
    return Axios.get(`${url}/caja`);
}

//=======================================================
//========        PRESTACIONES          =================
//=======================================================


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

export const crearPrestacion = (datos) => {
    return Axios.post(`${url}/prestaciones`, datos, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al crear la prestacion:", error);
        throw error;
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

export const eliminarPrestacion = (id) => {
    return Axios.delete(`${url}/prestaciones/${id}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al eliminar la prestacion:", error);
        throw error;
    });
}


//=======================================================
//===========        PACIENTES          =================
//=======================================================


export const obtenerPacientes = () => {
    return Axios.get(`${url}/pacientes`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al traer los pacientes:", error);
        return []; 
    });
}

export const crearPaciente = (datos) => {
    return Axios.post(`${url}/pacientes`, datos, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al crear el paciente:", error);
        throw error;
    });
}