import './Prestaciones.css'
import { useState, useEffect } from 'react'
import { obtenerPrestaciones } from '../../apis';

const Prestaciones = () => {
    
    const [prestaciones, setPrestaciones] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('Todos');
    
        useEffect (() => {
            obtenerPrestaciones().then(res => {
                setPrestaciones(res);
            })
        },[]);

    const prestadoresUnicos = ['Todos', ...new Set(prestaciones?.map(p => p.prestador))];
    const prestacionesFiltradas = filtroActivo === 'Todos' 
        ? prestaciones 
        : prestaciones.filter(prestacion => prestacion.prestador === filtroActivo);

    return (
        <div className="container-fluid mt-4">

            {/* LA BARRA DE PESTAÑAS (Estilo Bootstrap) */}
            <ul className="nav nav-tabs mb-4">
                {prestadoresUnicos.map((prestador, index) => (
                    <li className="nav-item" key={index}>
                        <button 
                            // Si el botón coincide con el filtro activo, le clavamos la clase 'active' de Bootstrap
                            className={`nav-link text-dark ${filtroActivo === prestador ? 'active fw-bold' : ''}`}
                            onClick={() => setFiltroActivo(prestador)}
                            style={{ cursor: 'pointer' }}
                        >
                            {prestador}
                        </button>
                    </li>
                ))}
            </ul>

            {/* LA TABLA */}
            <div className="table-responsive">
                <table className="table table-hover">
                    <thead className="table-light">
                        <tr>
                            <th>Fecha Inicio</th>
                            <th>Prestador</th>
                            <th>Paciente</th>
                            <th>Especialidad</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* ATENCIÓN ACÁ: Hacemos el map sobre el arreglo FILTRADO, no el original */}
                        {prestacionesFiltradas?.map((prestacion) => (
                            <tr key={prestacion.id}>
                                <td>{prestacion.fecha_inicio}</td>
                                <td>{prestacion.prestador}</td>
                                <td>{prestacion.paciente.nombre} {prestacion.paciente.apellido}</td>
                                <td>{prestacion.especialidad}</td>
                                <td>${prestacion.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
);
}

export default Prestaciones;