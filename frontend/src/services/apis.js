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

export const editarPaciente = (id, datos) => {
    return Axios.put(`${url}/pacientes/${id}`, datos, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al editar el paciente:", error);
        throw error;
    });
}

export const eliminarPaciente = (id) => {
    return Axios.delete(`${url}/pacientes/${id}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true' 
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al eliminar el paciente:", error);
        throw error;
    });
}

//=======================================================
//===========        RECURSOS          ==================
//=======================================================

export const obtenerRecursos = () => {
    return Axios.get(`${url}/recursos`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => {
        return respuesta.data; 
    })
    .catch(error => {
        console.error("Error al traer los recursos:", error);
        return []; 
    });
}

export const crearRecurso = (datosFormData) => {
    return Axios.post(`${url}/recursos`, datosFormData, {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'multipart/form-data' 
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al crear el recurso:", error);
        throw error;
    });
}

export const editarRecurso = (id, datosFormData) => {
    return Axios.put(`${url}/recursos/${id}`, datosFormData, {
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Content-Type': 'multipart/form-data' 
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al editar el recurso:", error);
        throw error;
    });
}

export const eliminarRecurso = (id) => {
    return Axios.delete(`${url}/recursos/${id}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al eliminar el recurso:", error);
        throw error;
    });
}

//=======================================================
//===========        ESPECIALIDADES        ==============
//=======================================================

export const obtenerEspecialidades = () => {
    return Axios.get(`${url}/especialidades`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al traer las especialidades:", error);
        return [];
    });
}

export const crearEspecialidad = (nombre) => {
    return Axios.post(`${url}/especialidades`, { nombre }, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al crear la especialidad:", error);
        throw error;
    });
}

export const eliminarEspecialidadGlobal = (id) => {
    return Axios.delete(`${url}/especialidades/${id}`, {
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
    .then(respuesta => respuesta.data)
    .catch(error => {
        console.error("Error al eliminar la especialidad:", error);
        throw error;
    });
}

