import './Recursos.css';

import { useState, useEffect } from 'react';
import { obtenerRecursos } from '../../services/apis.js';
import { formatearFecha, borrarTildes, mostrarLista, verificarCampo } from '../../services/utils';

const Recursos = () => {

    const [loading, setLoading] = useState(false);
    const [recursos, setRecursos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [recursoActual, setRecursoActual] = useState(null);

    useEffect(() => {
        setLoading(true);
        obtenerRecursos().then((data) => {
            setRecursos(data);
            setLoading(false);
        });
    }, []);

    const accionesBotones = [
        { nombre: "Editar Recurso", 
          icono: "bi bi-pencil-square",
          color: "rgb(165, 22, 22)",
          accion: (r) => {
            setRecursoActual(r);
          },
          modalTarget: "#modalEditarRecurso"
        },
        { nombre: "Eliminar Recurso",
          icono: "bi bi-trash3-fill",
          color: "rgb(165, 22, 22)",
          accion: (r) => {
            setRecursoActual(r);
          },  
          modalTarget: "#modalEliminarRecurso",
        },
    ];

    const guardarNuevoRecurso = (e) => {
        if (e) e.preventDefault(); 
        console.log("Acá va la lógica de crear un recurso");
    }

    const handleFormSubmit = (e) => {
        e.preventDefault();
        guardarNuevoRecurso();
    };

    const recursosFiltrados = recursos.filter(r => 
        borrarTildes((`${r.nombre} ${r.apellido}`).toLowerCase()).includes(borrarTildes(busqueda.toLowerCase())) ||
        String(r.id).includes(busqueda)
    );

    return (
        <div className='container-pacientes mt-4'> 
            {/* <-- FILTROS --> */}
            <div className='container-fluid my-3 px-4 d-flex align-items-center justify-content-between gap-2'>
                <div className='d-flex align-items-center gap-2'>
                    {/* Buscador */}
                    <strong className="filtro-abm d-flex align-items-center shadow" style={{ fontSize: "14px"}}>
                        <i className="bi bi-search me-2"></i>
                        <input 
                            className='input-filtro'
                            type="text"
                            placeholder="Buscar por nombre o id..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </strong>
                </div>

                <div className='btn boton-accion align-items-center d-flex gap-1' data-bs-toggle="modal" data-bs-target="#modalCrearRecurso">
                    <i className="bi bi-plus-circle mt-1 me-1"></i> Registrar Recurso 
                </div>
            </div>

            {/* <-- LISTA RECURSOS --> */}
            <ul className="list-group gap-3 mb-5">
                {loading ? (
                    <div className='h-100 d-flex justify-content-center align-items-center'>
                        <div className='spinner-border text-primary m-5' role='status'></div>
                    </div>
                ) :
                recursosFiltrados && recursosFiltrados.length > 0 ? (
                    recursosFiltrados.map(r => (
                        <li className='list-group-item d-flex row mx-4 p-4 rounded-3 shadow' key={r.id}>
                            <div className='col-2 border-end'>
                                <strong className='d-block mb-2'>Nombre: <span className="fw-bold text-danger">{r.nombre} {r.apellido}</span></strong>
                                <strong className='d-block'>Id Recurso: <span className="fw-normal">{r.id}</span></strong>
                                <strong className='d-block'>DNI: <span className="fw-normal">{verificarCampo(r.dni)}</span></strong>
                                <strong className='d-block'>Fecha Ingreso: <span className="fw-normal">{formatearFecha(r.fecha_ingreso)}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Dirección: <span className="fw-normal">{verificarCampo(r.direccion)}</span></strong>
                                <strong className='d-block'>Teléfono: <span className="fw-normal">{verificarCampo(r.telefono)}</span></strong>
                                <strong className='d-block'>Monotributista: <span className={r.es_monotributista ? "text-success fw-bold" : "text-muted"}>{r.es_monotributista ? "Sí" : "No"}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Especialidades: <span className="fw-normal">{mostrarLista(r.especialidades)}</span></strong>
                                <strong className='d-block'>Títulos: <span className="fw-normal">{mostrarLista(r.titulos)}</span></strong>
                                <strong className='d-block'>Certificados: <span className="fw-normal">{mostrarLista(r.certificados)}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>CV: <span className="fw-normal">{verificarCampo(r.cv_url)}</span></strong>
                                <strong className='d-block'>Contrato: <span className="fw-normal">{verificarCampo(r.contrato_url)}</span></strong>
                            </div>
                            <div className='col-1 d-flex flex-column align-items-center justify-content-center pe-0'>
                                {accionesBotones.map((boton, index) => (
                                    <button 
                                        key={index}
                                        className='btn' 
                                        type='button'
                                        title={boton.nombre}
                                        onClick={() => boton.accion(r)}
                                        data-bs-toggle={boton.modalTarget ? "modal" : undefined}
                                        data-bs-target={boton.modalTarget}
                                    >
                                        <i className={`${boton.icono} fs-4 m-0 botones-accion`} style={{color: `${boton.color}`}}></i>   
                                    </button>
                                ))}
                            </div>
                        </li>
                    ))
                ) : (
                    <div className='h-100 d-flex justify-content-center align-items-center'>
                        <p>No hay recursos registrados.</p>
                    </div>
                )}
            </ul>

            {/* <-- MODAL CREAR RECURSO --> */}
            <div className="modal fade" id="modalCrearRecurso" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Añadir Nuevo Recurso</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            {/* Soporte para Enter y Click */}
                            <form className="row g-3" id="formCrearRecurso" onSubmit={handleFormSubmit}>
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Datos Personales</h6>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Nombre <span className="text-danger">*</span></label>
                                    <input type="text" name="nombre" className="form-control" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Apellido <span className="text-danger">*</span></label>
                                    <input type="text" name="apellido" className="form-control" required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">DNI <span className="text-danger">*</span></label>
                                    <input type="text" name="dni" className="form-control" required />
                                </div>
                                
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Fecha de Ingreso</label>
                                    <input type="date" name="fecha_ingreso" className="form-control" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Teléfono</label>
                                    <input type="text" name="telefono" className="form-control" />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Dirección</label>
                                    <input type="text" name="direccion" className="form-control" />
                                </div>

                                <div className="col-12 mt-4 d-flex align-items-center">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input" type="checkbox" role="switch" name="es_monotributista" id="switchMonotributo" />
                                        <label className="form-check-label fw-bold ms-2" htmlFor="switchMonotributo">¿Es monotributista?</label>
                                    </div>
                                </div>
                                
                                {/* Botón submit oculto para que funcione el Enter */}
                                <button type="submit" className="d-none"></button>
                            </form>
                        </div>
                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={guardarNuevoRecurso}>Guardar Recurso</button>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default Recursos;