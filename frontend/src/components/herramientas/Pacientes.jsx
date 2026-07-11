import './Pacientes.css'
import { useState, useEffect } from 'react';
import { obtenerPacientes, crearPaciente } from '../../services/apis.js';
import { formatearFecha, borrarTildes } from '../../services/utils';

const Pacientes = () => {

    const [loading, setLoading] = useState(false);
    const [pacientes, setPacientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    useEffect(() => {
        setLoading(true);
        obtenerPacientes().then((data) => {
            setPacientes(data);
            setLoading(false);
        });
    }, []);

    const accionesBotones = [

        { nombre: "Editar Prestación", 
          icono: "bi bi-pencil-square",
          color: "rgb(165, 22, 22)",
          accion: (p) => {
            setPrestacionActual(p);
          },
          modalTarget: "#modalEditarPrestacion"
        },

        { nombre: "Eliminar Prestación",
          icono: "bi bi-trash3-fill",
          color: "rgb(165, 22, 22)",
          accion: (p) => {
            setPrestacionActual(p);
          },  
          modalTarget: "#modalEliminarPrestacion",
        },
    ];

    const guardarNuevoPaciente = () => {
        const form = document.getElementById('formCrearPaciente');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const datosAEnviar = Object.fromEntries(formData.entries());

        crearPaciente(datosAEnviar)
            .then(() => {
                obtenerPacientes().then(res => setPacientes(res));

                document.querySelector('#modalCrearPaciente .btn-close').click();

                form.reset();
            })
            .catch(error => {
                alert("Hubo un error al crear el paciente. Revisá la consola.");
            });
    }

    const pacientesFiltrados = pacientes.filter(p => 
        borrarTildes((`${p.nombre} ${p.apellido}`).toLowerCase()).includes(borrarTildes(busqueda.toLowerCase()))
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
                            placeholder="Buscar paciente..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)} 
                            style={{ width: "200px" }}
                        />
                    </strong>

                    {/* <strong className="filtro-abm d-flex align-items-center shadow" style={{ fontSize: "14px"}}>Deuda: 
                        <select 
                            className="dropdown-filtro form-select form-select-sm" 
                                // value={deuda} 
                                // onChange={(e) => setDeuda(e.target.value)}
                            style={{ width: "auto", cursor: "pointer" }}
                        >
                            <option value="Todas">Todas</option>
                            <option value="Pagadas">Pagadas</option>
                            <option value="Impagas">Impagas</option>
                        </select>
                    </strong>

                    <strong className="filtro-abm d-flex align-items-center shadow" style={{ fontSize: "14px"}}>Estado: 
                        <select 
                            className="dropdown-filtro form-select form-select-sm" 
                                // value={estado} 
                                // onChange={(e) => setEstado(e.target.value)}
                            style={{ width: "auto", cursor: "pointer" }}
                        >
                            <option value="Todos">Todos</option>
                            <option value="Sin asignar">Sin asignar</option>
                            <option value="Asignado">Asignado</option>
                            <option value="Pendiente">Pendiente</option>
                            <option value="Finalizado">Finalizado</option>
                        </select>
                    </strong>

                    <strong className="filtro-abm d-flex align-items-center shadow" style={{ fontSize: "14px"}}>Especialidad: 
                        <select 
                            className="dropdown-filtro form-select form-select-sm" 
                            // value={especialidad} 
                            // onChange={(e) => setEspecialidad(e.target.value)}
                            style={{ width: "auto", cursor: "pointer" }}
                        >
                            <option value="Todas">Todas</option>
                            <option value="Traslado">Traslado</option>
                            <option value="Enfermería">Enfermería</option>
                            <option value="Dialisis">Diálisis</option>
                        </select>
                    </strong> */}

                </div>

                <div className='btn boton-accion align-items-center d-flex gap-1' data-bs-toggle="modal" data-bs-target="#modalCrearPaciente">
                    <i className="bi bi-plus-circle mt-1 me-1"></i> Registrar Paciente 
                </div>
            </div>

            {/* <-- LISTA PACIENTES --> */}
            <ul className="list-group gap-3 mb-5">
                {loading ? (
                    <div className='h-100 d-flex justify-content-center align-items-center'>
                        <div className='spinner-border text-primary m-5' role='status'></div>
                    </div>
                ) :
                pacientesFiltrados && pacientesFiltrados.length > 0 ? (
                    pacientesFiltrados.map(p => (
                        <li className='list-group-item d-flex row mx-4 p-4 rounded-3 shadow' key={p.id}>
                            <div className='col-3 border-end'>
                                <strong className='d-block mb-2'>Nombre: <span className="fw-bolc text-danger">{p.nombre} {p.apellido}</span></strong>
                                <strong className='d-block'>DNI: <span className="fw-normal">{p.dni}</span></strong>
                                <strong className='d-block'>Fecha Nacimiento: <span className="fw-normal">{formatearFecha(p.fecha_nacimiento)}</span></strong>
                                <strong className='d-block'>Teléfono: <span className="fw-normal">{p.telefono}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Diagnóstico: <span className="fw-normal">{p.diagnostico}</span></strong>
                                <strong className='d-block'>Dirección: <span className="fw-normal">{p.direccion}</span></strong>
                                <strong className='d-block'>Localidad: <span className="fw-normal">{p.localidad}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Email: <span className="fw-normal">{p.email}</span></strong>
                                <strong className='d-block'>Obra Social: <span className="fw-normal">{p.obra_social}</span></strong>
                                <strong className='d-block'>N° Afiliado: <span className="fw-normal">{p.numero_afiliado}</span></strong>
                            </div>
                            <div className='col-2 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Observaciones: <span className="fw-normal">{p.observaciones}</span></strong>
                            </div>
                            <div className='col-1 d-flex flex-column'>
                                {accionesBotones.map((boton, index) => (
                                    <button 
                                        key={index}
                                        className='btn' 
                                        type='button'
                                        title={boton.nombre}
                                        onClick={() => boton.accion(p)}
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
                        <p>No hay pacientes registrados.</p>
                    </div>
                )}
            </ul>
            {/* <-- MODAL CREAR PACIENTE --> */}
            <div className="modal fade" id="modalCrearPaciente" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Registrar Nuevo Paciente</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body pt-3">
                            <form className="row g-3" id="formCrearPaciente">

                                {/* --- DATOS PERSONALES --- */}
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
                                    <label className="form-label fw-bold">Fecha de Nacimiento</label>
                                    <input type="date" name="fecha_nacimiento" className="form-control" />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Dirección</label>
                                    <input type="text" name="direccion" className="form-control" />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Localidad</label>
                                    <input type="text" name="localidad" className="form-control" />
                                </div>

                                {/* --- DATOS DE CONTACTO --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2" style={{color: 'var(--color-primario)'}}>Contacto</h6>
                                
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Teléfono</label>
                                    <input type="text" name="telefono" className="form-control" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Email</label>
                                    <input type="email" name="email" className="form-control" />
                                </div>

                                {/* --- DATOS MÉDICOS Y COBERTURA --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2" style={{color: 'var(--color-primario)'}}>Datos Médicos y Cobertura</h6>

                                <div className="col-md-12">
                                    <label className="form-label fw-bold">Diagnóstico</label>
                                    <input type="text" name="diagnostico" className="form-control" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Obra Social</label>
                                    <input type="text" name="obra_social" className="form-control" />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">N° Afiliado</label>
                                    <input type="text" name="numero_afiliado" className="form-control" />
                                </div>

                                <div className="col-12 mt-4">
                                    <label className="form-label fw-bold">Observaciones</label>
                                    <textarea className="form-control" rows="2" name="observaciones"></textarea>
                                </div>

                            </form>
                        </div>

                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={guardarNuevoPaciente}>Guardar Paciente</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Pacientes;