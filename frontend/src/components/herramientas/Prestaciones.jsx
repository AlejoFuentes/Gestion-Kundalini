import './Prestaciones.css'
import { useState, useEffect } from 'react'
import { obtenerPrestaciones } from '../../services/apis';
import { formatearFecha, formatearMoneda } from '../../services/utils';

const Prestaciones = () => {
    
    const [prestaciones, setPrestaciones] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('Todos');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estado, setEstado] = useState('Todas');
    
        useEffect (() => {
            obtenerPrestaciones().then(res => {
                setPrestaciones(res);
            })
        },[]);

    const prestadoresUnicos = ['Todos', ...new Set(prestaciones?.map(p => p.prestador))];

    const filtroPrestador = (prestacion) => {
        return filtroActivo === 'Todos' || prestacion.prestador === filtroActivo;
    }

    const filtroFechas = (prestacion) => {
        const fechaPrestacion = prestacion.fecha_inicio;
        
        const cumpleDesde = fechaDesde === "" || fechaPrestacion >= fechaDesde;
        const cumpleHasta = fechaHasta === "" || fechaPrestacion <= fechaHasta;
        
        return cumpleDesde && cumpleHasta;
    }

    const filtroEstado = (prestacion) => {
        return estado === "Todas" || 
              (estado === "Pagadas" && prestacion.pagado === true) ||
              (estado === "Impagas" && prestacion.pagado === false);
    }

    const prestacionesFiltradas = prestaciones?.filter(prestacion => 
        filtroPrestador(prestacion) && 
        filtroFechas(prestacion) &&
        filtroEstado(prestacion)
    ) || [];

    return (
        <div className="container-prestaciones mt-4">
            {/* <-- FILTRO PRESTADORES --> */}
            <ul className="nav nav-tabs ms-1 mb-4">
                {prestadoresUnicos.map((prestador, index) => (
                    <li className="nav-item" key={index}>
                        <button 
                            className={`boton-selector nav-link text-dark ${filtroActivo === prestador ? 'active fw-bold' : ''}`}
                            onClick={() => setFiltroActivo(prestador)}
                            style={{ cursor: 'pointer' }}
                        >
                            {prestador}
                        </button>
                    </li>
                ))}
            </ul>
            {/* <-- TODOS LOS FILTROS --> */}
            <div className='container-fluid my-3 px-4 d-flex align-items-center gap-2'>
                <span className="filtro-prestacion" style={{ fontSize: "14px"}}>Fecha desde:&nbsp; 
                    <input 
                        className='input-filtro'
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)} 
                    />
                </span>
                <span className="filtro-prestacion" style={{ fontSize: "14px"}}>Fecha hasta:&nbsp; 
                    <input 
                        className='input-filtro'
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)} 
                    />
                </span>
                <span className="filtro-prestacion d-flex align-items-center" style={{ fontSize: "14px"}}>Estado:&nbsp; 
                    <select 
                        className="dropdown-filtro form-select form-select-sm" 
                        value={estado} 
                        onChange={(e) => setEstado(e.target.value)}
                        style={{ width: "auto", cursor: "pointer" }}
                    >
                        <option value="Todas">Todas</option>
                        <option value="Pagadas">Pagadas</option>
                        <option value="Impagas">Impagas</option>
                    </select>
                </span>
            </div>

            {/* <-- LISTA --> */}
            <ul className="list-group gap-3">
                {prestacionesFiltradas && prestacionesFiltradas.length > 0 ? (
            prestacionesFiltradas.map(p => (
                <li className='list-group-item d-flex row mx-4 p-4 rounded-3' key={p.id}>
                    {/* <-- COLUMNA 1 --> */}
                    <div className='col-2 border-end'>
                        <strong className='d-block mb-2'>Prestador: <span className="fw-normal">{p.prestador}</span></strong>
                        <strong className='d-block'>Id Prestación: <span className="fw-normal">{p.id}</span></strong>
                        <strong className='d-block'>Fecha Inicio: <span className="fw-normal">{formatearFecha(p.fecha_inicio)}</span></strong>
                        <strong className='d-block'>Fecha Fin: <span className="fw-normal">{p.fecha_fin? formatearFecha(p.fecha_fin) : "- -"}</span></strong>
                        <strong className='d-block'>Especialidad: <span className="fw-normal">{p.especialidad}</span></strong>
                    </div>
                    {/* <-- COLUMNA 2 --> */}
                    <div className='col-4 border-end'>
                        <strong className='d-block mb-2'>Paciente: <span className="fw-normal">{p.paciente.nombre} {p.paciente.apellido}</span></strong>
                        <strong className='d-block'>Fecha de nacimiento: <span className="fw-normal">{formatearFecha(p.paciente.fecha_nacimiento)}</span></strong>
                        <strong className='d-block'>Diagnóstico: <span className="fw-normal">{p.paciente.diagnostico}</span></strong>
                        <strong className='d-block'>Dirección: <span className="fw-normal">{p.paciente.direccion}</span></strong>
                        <strong className='d-block'>Localidad: <span className="fw-normal">{p.paciente.localidad}</span></strong>
                    </div>
                    {/* <-- COLUMNA 3 --> */}
                    <div className='col-2 border-end'>
                        <strong className='d-block'>Cantidad: <span className="fw-normal">{p.cantidad}</span></strong>
                        <strong className='d-block'>Frecuencia: <span className="fw-normal">{p.frecuencia}</span></strong>
                        <strong className='d-block'>Valor: <span className="fw-normal">${formatearMoneda(p.valor)}</span></strong>
                        <strong className='d-block'>Total: <span className="fw-normal">${formatearMoneda(p.total)}</span></strong>
                        <strong className='d-block'>Estado: <span className="fw-normal">{p.pagado ? "Pagada" : "Impaga"}</span></strong>
                    </div>
                    {/* <-- COLUMNA 4 --> */}
                    <div className='col-4 d-flex align-items-center'>
                        <strong className='d-block'>Observaciones: <span className="fw-normal">{p.observaciones}</span></strong>
                    </div>
                </li>
                ))) : (
                    
                    <li className= 'list-group-item text-center text-muted mx-3'> No hay resultados. </li>
                    
                )
            }
            </ul>

        </div>
    );
}

export default Prestaciones;