import './Pacientes.css'
import { useState, useEffect } from 'react';
import { obtenerPacientes, crearPaciente, editarPaciente, eliminarPaciente } from '../../services/apis.js';
import { formatearFecha, borrarTildes } from '../../services/utils';

const Pacientes = () => {

    const [loading, setLoading] = useState(false);
    const [pacientes, setPacientes] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [pacienteActual, setPacienteActual] = useState(null);

    useEffect(() => {
        setLoading(true);
        obtenerPacientes().then((data) => {
            setPacientes(data);
            setLoading(false);
        });
    }, []);

    const accionesBotones = [

        { nombre: "Editar Paciente", 
          icono: "bi bi-pencil-square",
          color: "rgb(165, 22, 22)",
          accion: (p) => {
            setPacienteActual(p);
          },
          modalTarget: "#modalEditarPaciente"
        },

        { nombre: "Eliminar Paciente",
          icono: "bi bi-trash3-fill",
          color: "rgb(165, 22, 22)",
          accion: (p) => {
            setPacienteActual(p);
          },  
          modalTarget: "#modalEliminarPaciente",
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

    const handleEditarPaciente = () => {
        const form = document.getElementById('formEditarPaciente');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const datosAEnviar = Object.fromEntries(formData.entries());

        editarPaciente(pacienteActual.id, datosAEnviar)
            .then(() => {
                obtenerPacientes().then(res => setPacientes(res));
                document.querySelector('#modalEditarPaciente .btn-close').click();
                setPacienteActual(null);
            })
            .catch(error => {
                alert("Hubo un error al editar el paciente. Revisá la consola.");
            });
    }

    const handleEliminarPaciente = () => {
        if (!pacienteActual) return;

        eliminarPaciente(pacienteActual.id)
            .then(() => {
                obtenerPacientes().then(res => setPacientes(res)); 
                document.querySelector('#modalEliminarPaciente .btn-close').click(); 
                setPacienteActual(null); 
            })
            .catch(error => {
                alert("Hubo un error al eliminar el paciente. Revisá la consola.");
            });
    }

    const pacientesFiltrados = pacientes.filter(p => 
        borrarTildes((`${p.nombre} ${p.apellido}`).toLowerCase()).includes(borrarTildes(busqueda.toLowerCase())) ||
        String(p.id).includes(busqueda)
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
                                <strong className='d-block'>Id Paciente: <span className="fw-normal">{p.id}</span></strong>
                                <strong className='d-block'>DNI: <span className="fw-normal">{p.dni ? p.dni : '- -'}</span></strong>
                                <strong className='d-block'>Fecha Nacimiento: <span className="fw-normal">{formatearFecha(p.fecha_nacimiento)}</span></strong>
                                <strong className='d-block'>Teléfono: <span className="fw-normal">{p.telefono ? p.telefono : '- -'}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Diagnóstico: <span className="fw-normal">{p.diagnostico ? p.diagnostico : '- -'}</span></strong>
                                <strong className='d-block'>Dirección: <span className="fw-normal">{p.direccion ? p.direccion : '- -'}</span></strong>
                                <strong className='d-block'>Localidad: <span className="fw-normal">{p.localidad ? p.localidad : '- -'}</span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Email: <span className="fw-normal">{p.email ? p.email : '- -'}</span></strong>
                                <strong className='d-block'>Obra Social: <span className="fw-normal">{p.obra_social ? p.obra_social : '- -'}</span></strong>
                                <strong className='d-block'>N° Afiliado: <span className="fw-normal">{p.numero_afiliado ? p.numero_afiliado : '- -'}</span></strong>
                            </div>
                            <div className='col-2 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>Observaciones: <span className="fw-normal">{p.observaciones ? p.observaciones : '- -'}</span></strong>
                            </div>
                            <div className='col-1 d-flex flex-column align-items-center justify-content-center pe-0'>
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
            
            {/* <-- MODAL EDITAR PACIENTE --> */}
            <div className="modal fade" id="modalEditarPaciente" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Editar Paciente <span className='text-danger fs-5 fw-bold'>#{pacienteActual?.id}</span> </h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body pt-3">
                            <form className="row g-3" id="formEditarPaciente" key={pacienteActual?.id || 'nuevo'}>

                                {/* --- DATOS PERSONALES --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Datos Personales</h6>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Nombre <span className="text-danger">*</span></label>
                                    <input type="text" name="nombre" className="form-control" defaultValue={pacienteActual?.nombre} required />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Apellido <span className="text-danger">*</span></label>
                                    <input type="text" name="apellido" className="form-control" defaultValue={pacienteActual?.apellido} required />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">DNI <span className="text-danger">*</span></label>
                                    <input type="text" name="dni" className="form-control" defaultValue={pacienteActual?.dni} required />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Fecha de Nacimiento</label>
                                    <input 
                                        type="date" 
                                        name="fecha_nacimiento" 
                                        className="form-control" 
                                        defaultValue={pacienteActual?.fecha_nacimiento ? String(pacienteActual.fecha_nacimiento).substring(0, 10) : ''} 
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Dirección</label>
                                    <input type="text" name="direccion" className="form-control" defaultValue={pacienteActual?.direccion} />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Localidad</label>
                                    <input type="text" name="localidad" className="form-control" defaultValue={pacienteActual?.localidad} />
                                </div>

                                {/* --- DATOS DE CONTACTO --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2" style={{color: 'var(--color-primario)'}}>Contacto</h6>
                                
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Teléfono</label>
                                    <input type="number" name="telefono" className="form-control" defaultValue={pacienteActual?.telefono} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Email</label>
                                    <input type="email" name="email" className="form-control" defaultValue={pacienteActual?.email} />
                                </div>

                                {/* --- DATOS MÉDICOS Y COBERTURA --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2" style={{color: 'var(--color-primario)'}}>Datos Médicos y Cobertura</h6>

                                <div className="col-md-12">
                                    <label className="form-label fw-bold">Diagnóstico</label>
                                    <input type="text" name="diagnostico" className="form-control" defaultValue={pacienteActual?.diagnostico} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Obra Social</label>
                                    <input type="text" name="obra_social" className="form-control" defaultValue={pacienteActual?.obra_social} />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">N° Afiliado</label>
                                    <input type="text" name="numero_afiliado" className="form-control" defaultValue={pacienteActual?.numero_afiliado} />
                                </div>

                                <div className="col-12 mt-4">
                                    <label className="form-label fw-bold">Observaciones</label>
                                    <textarea className="form-control" rows="2" name="observaciones" defaultValue={pacienteActual?.observaciones}></textarea>
                                </div>

                            </form>
                        </div>

                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={handleEditarPaciente}>Actualizar Paciente</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <-- MODAL ELIMINAR PACIENTE --> */}
            <div className="modal fade" id="modalEliminarPaciente" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center pb-4 pt-0">
                            <i className="bi bi-exclamation-circle text-danger mb-2" style={{fontSize: '3.5rem'}}></i>
                            <h5 className="mt-2 fw-bold">¿Eliminar paciente?</h5>
                            <p className="text-muted" style={{fontSize: '14px'}}>
                                Vas a eliminar a <strong className="text-dark">{pacienteActual?.nombre} {pacienteActual?.apellido}</strong>. Esta acción no se puede deshacer.
                            </p>
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={handleEliminarPaciente}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    )
}

export default Pacientes;