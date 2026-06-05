import Axios from 'axios';

const url = 'http://localhost:3000'

export const obtenerMovimientos = () => {
    return Axios.get(`${url}/caja`);
}

