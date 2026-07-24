import { useState, useEffect } from 'react';
import { obtenerRecursos, crearRecurso, editarRecurso, eliminarRecurso, obtenerEspecialidades } from '../../services/apis.js';
import { formatearFecha, borrarTildes, mostrarLista, verificarCampo, obtenerURLCompleta } from '../../services/utils';
import { SelectorEspecialidades } from './SelectorEspecialidades'; 

const Recursos = () => {

    const [loading, setLoading] = useState(false);
    const [recursos, setRecursos] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [recursoActual, setRecursoActual] = useState(null);
    
    const [especialidadesGlobales, setEspecialidadesGlobales] = useState([]);
    const [especialidadesCrear, setEspecialidadesCrear] = useState([]);
    const [especialidadesEditar, setEspecialidadesEditar] = useState([]);

    const cargarCatalogoEspecialidades = () => {
        obtenerEspecialidades().then(data => setEspecialidadesGlobales(data));
    };

    const limpiarNombreArchivo = (url) => {
        if (!url) return '- -';
        const soloNombreConTimestamp = url.replace(/\\/g, '/').split('/').pop();
        const partes = soloNombreConTimestamp.split('-');
        if (partes.length > 1 && !isNaN(partes[0])) {
            return partes.slice(1).join('-');
        }
        return soloNombreConTimestamp;
    };

    useEffect(() => {
        setLoading(true);
        obtenerRecursos().then((data) => {
            setRecursos(data);
            setLoading(false);
        });

        cargarCatalogoEspecialidades();

        const handleHiddenModal = (e) => {
            const form = e.target.querySelector('form');
            if (form) form.reset();
            if (e.target.id === 'modalEditarRecurso' || e.target.id === 'modalEliminarRecurso') setRecursoActual(null);
            setEspecialidadesCrear([]);
            setEspecialidadesEditar([]);
            limpiarArchivosNuevos();
        };

        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => modal.addEventListener('hidden.bs.modal', handleHiddenModal));

        return () => {
            modals.forEach(modal => modal.removeEventListener('hidden.bs.modal', handleHiddenModal));
        };
    }, []);

    useEffect(() => {
        if (recursoActual && recursoActual.especialidades) {
            setEspecialidadesEditar(recursoActual.especialidades);
        } else {
            setEspecialidadesEditar([]);
        }
    }, [recursoActual]);

    const [archivosNuevos, setArchivosNuevos] = useState({
        cvCrear: [], contratoCrear: [], titulosCrear: [], certificadosCrear: [],
        cvEditar: [], contratoEditar: [], titulosEditar: [], certificadosEditar: []
    });

    const accionesBotones = [
        { 
            nombre: "Editar Recurso", 
            icono: "bi bi-pencil-square", 
            color: "rgb(165, 22, 22)", 
            accion: (r) => setRecursoActual(r), 
            modalTarget: "#modalEditarRecurso" 
        },
        { 
            nombre: "Eliminar Recurso", 
            icono: "bi bi-trash3-fill", 
            color: "rgb(165, 22, 22)", 
            accion: (r) => setRecursoActual(r), 
            modalTarget: "#modalEliminarRecurso" 
        },
    ];

    const manejarSeleccionArchivos = (e, campo) => {
        const archivos = Array.from(e.target.files);
        setArchivosNuevos(prev => ({ ...prev, [campo]: archivos }));
    };

    const limpiarArchivosNuevos = () => {
        setArchivosNuevos({
            cvCrear: [], contratoCrear: [], titulosCrear: [], certificadosCrear: [],
            cvEditar: [], contratoEditar: [], titulosEditar: [], certificadosEditar: []
        });
    };

    const eliminarArchivoNuevo = (campo, index) => {
        setArchivosNuevos(prev => {
            const nuevaLista = [...prev[campo]];
            nuevaLista.splice(index, 1);

            const inputElement = document.getElementById(campo);
            if (inputElement) {
                const dataTransfer = new DataTransfer();
                nuevaLista.forEach(file => dataTransfer.items.add(file));
                inputElement.files = dataTransfer.files;
            }

            return { ...prev, [campo]: nuevaLista };
        });
    };

    const eliminarArchivoViejo = (campo, index) => {
        setRecursoActual(prev => {
            const nuevaLista = [...prev[campo]];
            nuevaLista.splice(index, 1);
            return { ...prev, [campo]: nuevaLista };
        });
    };

    const eliminarArchivoUnico = (campo) => {
        setRecursoActual(prev => ({ ...prev, [campo]: null }));
    };

    const guardarNuevoRecurso = (e) => {
        e.preventDefault(); 
        
        const form = document.getElementById('formCrearRecurso');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        formData.set('es_monotributista', form.es_monotributista.checked); 
        
        especialidadesCrear.forEach(esp => formData.append('especialidades', esp));

        crearRecurso(formData)
            .then(() => {
                obtenerRecursos().then(res => setRecursos(res));
                document.querySelector('#modalCrearRecurso .btn-close').click();
                form.reset();
                setEspecialidadesCrear([]);
                limpiarArchivosNuevos();
            })
            .catch(error => alert("Hubo un error al crear el recurso."));
    }

    const guardarEdicionRecurso = (e) => {
        if (e) e.preventDefault(); 
        
        const form = document.getElementById('formEditarRecurso'); 
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        formData.set('es_monotributista', form.es_monotributista.checked); 

        especialidadesEditar.forEach(esp => formData.append('especialidades', esp));

        formData.append('titulos_viejos', JSON.stringify(recursoActual.titulos || []));
        formData.append('certificados_viejos', JSON.stringify(recursoActual.certificados || []));
        formData.append('cv_url_viejo', recursoActual.cv_url || '');
        formData.append('contrato_url_viejo', recursoActual.contrato_url || '');

        editarRecurso(recursoActual.id, formData)
            .then(() => {
                obtenerRecursos().then(res => setRecursos(res));
                document.querySelector('#modalEditarRecurso .btn-close').click();
                setRecursoActual(null);
                form.reset();
                setEspecialidadesEditar([]);
                limpiarArchivosNuevos();
            })
            .catch(error => alert("Hubo un error al editar el recurso."));
    }

    const confirmarEliminarRecurso = () => {
        if (!recursoActual) return;
        eliminarRecurso(recursoActual.id)
            .then(() => {
                obtenerRecursos().then(res => setRecursos(res));
                document.querySelector('#modalEliminarRecurso .btn-close').click();
                setRecursoActual(null);
            })
            .catch(error => alert("Hubo un error al eliminar el recurso."));
    }

    const recursosFiltrados = recursos.filter(r => 
        borrarTildes((`${r.nombre} ${r.apellido}`).toLowerCase()).includes(borrarTildes(busqueda.toLowerCase())) ||
        String(r.id).includes(busqueda)
    );

    return (
        <div className='container-pacientes mt-4'> 
            {/* <-- FILTROS --> */}
            <div className='container-fluid my-3 px-4 d-flex align-items-center justify-content-between gap-2'>
                <div className='d-flex align-items-center gap-2'>
                    <strong className="filtro-abm d-flex align-items-center shadow" style={{ fontSize: "14px"}}>
                        <i className="bi bi-search me-2"></i>
                        <input className='input-filtro' type="text" placeholder="Buscar por nombre o id..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
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
                                
                                <strong className='d-block mt-1'>Títulos: <span className="fw-normal">
                                    {r.titulos && r.titulos.length > 0 ? 
                                        r.titulos.map((t, i) => (
                                            <span key={i}>
                                                <a href={obtenerURLCompleta(t)} target="_blank" rel="noopener noreferrer" className="me-2">{limpiarNombreArchivo(t)}</a>
                                                {i < r.titulos.length - 1 ? '/ ' : ''}
                                            </span>
                                        )) : <span className="text-dark">- -</span>
                                    }
                                </span></strong>
                                
                                <strong className='d-block mt-1'>Certificados: <span className="fw-normal">
                                    {r.certificados && r.certificados.length > 0 ? 
                                        r.certificados.map((c, i) => (
                                            <span key={i}>
                                                <a href={obtenerURLCompleta(c)} target="_blank" rel="noopener noreferrer" className="me-2">{limpiarNombreArchivo(c)}</a>
                                                {i < r.certificados.length - 1 ? '/ ' : ''}
                                            </span>
                                        )) : <span className="text-dark">- -</span>
                                    }
                                </span></strong>
                            </div>
                            <div className='col-3 border-end d-flex flex-column justify-content-center'>
                                <strong className='d-block'>CV: <span className="fw-normal ms-1">
                                    {r.cv_url ? <a href={obtenerURLCompleta(r.cv_url)} target="_blank" rel="noopener noreferrer">{limpiarNombreArchivo(r.cv_url)}</a> : '- -'}
                                </span></strong>
                                <strong className='d-block mt-1'>Contrato: <span className="fw-normal ms-1">
                                    {r.contrato_url ? <a href={obtenerURLCompleta(r.contrato_url)} target="_blank" rel="noopener noreferrer">{limpiarNombreArchivo(r.contrato_url)}</a> : '- -'}
                                </span></strong>
                            </div>
                            <div className='col-1 d-flex flex-column align-items-center justify-content-center pe-0'>
                                {accionesBotones.map((boton, index) => (
                                    <button key={index} className='btn' type='button' title={boton.nombre} onClick={() => boton.accion(r)} data-bs-toggle={boton.modalTarget ? "modal" : undefined} data-bs-target={boton.modalTarget}>
                                        <i className={`${boton.icono} fs-4 m-0 botones-accion`} style={{color: `${boton.color}`}}></i>   
                                    </button>
                                ))}
                            </div>
                        </li>
                    ))
                ) : (
                    <div className='h-100 d-flex justify-content-center align-items-center'><p>No hay recursos registrados.</p></div>
                )}
            </ul>

            {/* <-- MODAL CREAR RECURSO --> */}
            <div className="modal fade" id="modalCrearRecurso" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Nuevo Recurso</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            <form className="row g-3" id="formCrearRecurso" onSubmit={guardarNuevoRecurso} encType="multipart/form-data">
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Datos Personales</h6>
                                <div className="col-md-4"><label className="form-label fw-bold">Nombre </label> <span className='fw-bold text-danger'>*</span><input type="text" name="nombre" className="form-control" required /></div>
                                <div className="col-md-4"><label className="form-label fw-bold">Apellido </label> <span className='fw-bold text-danger'>*</span><input type="text" name="apellido" className="form-control" required /></div>
                                <div className="col-md-4"><label className="form-label fw-bold">DNI </label> <span className='fw-bold text-danger'>*</span><input type="text" name="dni" className="form-control" required /></div>
                                <div className="col-md-4"><label className="form-label fw-bold">Fecha de Ingreso</label><input type="date" name="fecha_ingreso" className="form-control" /></div>
                                <div className="col-md-4"><label className="form-label fw-bold">Teléfono</label><input type="text" name="telefono" className="form-control" /></div>
                                <div className="col-md-4"><label className="form-label fw-bold">Dirección</label><input type="text" name="direccion" className="form-control" /></div>
                                
                                <div className="col-12 mt-3">
                                    <SelectorEspecialidades 
                                        especialidadesGlobales={especialidadesGlobales}
                                        especialidadesSeleccionadas={especialidadesCrear}
                                        setEspecialidadesSeleccionadas={setEspecialidadesCrear}
                                        recargarCatalogo={cargarCatalogoEspecialidades}
                                    />
                                </div>

                                <div className="col-12 mt-3 d-flex align-items-center">
                                    <div className="form-check form-switch">
                                        <input className="form-check-input switch-rojo" type="checkbox" role="switch" name="es_monotributista" id="switchMonotributo" />
                                        <label className="form-check-label fw-bold ms-2" htmlFor="switchMonotributo">¿Es monotributista?</label>
                                    </div>
                                </div>
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Documentación</h6>
                                
                                <div className="col-md-6">
                                    <label className="form-label fw-bold d-block">CV</label>
                                    <label htmlFor="cvCrear" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                    <input type="file" name="cv_url" id="cvCrear" className="d-none" onChange={(e) => manejarSeleccionArchivos(e, 'cvCrear')} />
                                    {archivosNuevos.cvCrear.length > 0 && (
                                        <div className="mt-2 d-flex flex-column gap-1">
                                            {archivosNuevos.cvCrear.map((f, i) => (
                                                <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('cvCrear', i)} title="Quitar archivo"></i>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold d-block">Contrato</label>
                                    <label htmlFor="contratoCrear" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                    <input type="file" name="contrato_url" id="contratoCrear" className="d-none" onChange={(e) => manejarSeleccionArchivos(e, 'contratoCrear')} />
                                    {archivosNuevos.contratoCrear.length > 0 && (
                                        <div className="mt-2 d-flex flex-column gap-1">
                                            {archivosNuevos.contratoCrear.map((f, i) => (
                                                <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('contratoCrear', i)} title="Quitar archivo"></i>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold d-block">Títulos</label>
                                    <label htmlFor="titulosCrear" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                    <input type="file" name="titulos" id="titulosCrear" className="d-none" multiple onChange={(e) => manejarSeleccionArchivos(e, 'titulosCrear')} />
                                    {archivosNuevos.titulosCrear.length > 0 && (
                                        <div className="mt-2 d-flex flex-column gap-1">
                                            {archivosNuevos.titulosCrear.map((f, i) => (
                                                <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('titulosCrear', i)} title="Quitar archivo"></i>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold d-block">Certificados</label>
                                    <label htmlFor="certificadosCrear" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                    <input type="file" name="certificados" id="certificadosCrear" className="d-none" multiple onChange={(e) => manejarSeleccionArchivos(e, 'certificadosCrear')} />
                                    {archivosNuevos.certificadosCrear.length > 0 && (
                                        <div className="mt-2 d-flex flex-column gap-1">
                                            {archivosNuevos.certificadosCrear.map((f, i) => (
                                                <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('certificadosCrear', i)} title="Quitar archivo"></i>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={guardarNuevoRecurso}>Guardar Recurso</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <-- MODAL EDITAR RECURSO --> */}
            <div className="modal fade" id="modalEditarRecurso" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Editar Recurso <span className='text-danger fs-5'>#{recursoActual?.id}</span></h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            {recursoActual && (
                                <form className="row g-3" id="formEditarRecurso" onSubmit={guardarEdicionRecurso} encType="multipart/form-data">
                                    <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Datos Personales</h6>
                                    
                                    <div className="col-md-4"><label className="form-label fw-bold">Nombre </label> <span className='fw-bold text-danger'>*</span><input type="text" name="nombre" className="form-control" defaultValue={recursoActual.nombre} required /></div>
                                    <div className="col-md-4"><label className="form-label fw-bold">Apellido </label> <span className='fw-bold text-danger'>*</span><input type="text" name="apellido" className="form-control" defaultValue={recursoActual.apellido} required /></div>
                                    <div className="col-md-4"><label className="form-label fw-bold">DNI </label> <span className='fw-bold text-danger'>*</span><input type="text" name="dni" className="form-control" defaultValue={recursoActual.dni} required /></div>
                                    
                                    <div className="col-md-4"><label className="form-label fw-bold">Fecha de Ingreso</label><input type="date" name="fecha_ingreso" className="form-control" defaultValue={recursoActual.fecha_ingreso ? recursoActual.fecha_ingreso.split('T')[0] : ''} /></div>
                                    
                                    <div className="col-md-4"><label className="form-label fw-bold">Teléfono</label><input type="text" name="telefono" className="form-control" defaultValue={recursoActual.telefono} /></div>
                                    <div className="col-md-4"><label className="form-label fw-bold">Dirección</label><input type="text" name="direccion" className="form-control" defaultValue={recursoActual.direccion} /></div>
                                    
                                    <div className="col-12 mt-3">
                                        <SelectorEspecialidades 
                                            especialidadesGlobales={especialidadesGlobales}
                                            especialidadesSeleccionadas={especialidadesEditar}
                                            setEspecialidadesSeleccionadas={setEspecialidadesEditar}
                                            recargarCatalogo={cargarCatalogoEspecialidades}
                                        />
                                    </div>

                                    <div className="col-12 mt-3 d-flex align-items-center">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input switch-rojo" type="checkbox" role="switch" name="es_monotributista" id="switchMonotributoEditar" defaultChecked={recursoActual.es_monotributista} />
                                            <label className="form-check-label fw-bold ms-2" htmlFor="switchMonotributoEditar">¿Es monotributista?</label>
                                        </div>
                                    </div>
                                    
                                    <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Documentación</h6>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold d-block">CV</label>
                                        <label htmlFor="cvEditar" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                        <input type="file" name="cv_url" id="cvEditar" className="d-none" onChange={(e) => manejarSeleccionArchivos(e, 'cvEditar')} />
                                        
                                        {archivosNuevos.cvEditar.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {archivosNuevos.cvEditar.map((f, i) => (
                                                    <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                        <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('cvEditar', i)} title="Quitar archivo"></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        
                                        {recursoActual.cv_url && archivosNuevos.cvEditar.length === 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                <span className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{limpiarNombreArchivo(recursoActual.cv_url)}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoUnico('cv_url')} title="Eliminar este archivo"></i>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold d-block">Contrato</label>
                                        <label htmlFor="contratoEditar" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                        <input type="file" name="contrato_url" id="contratoEditar" className="d-none" onChange={(e) => manejarSeleccionArchivos(e, 'contratoEditar')} />
                                        
                                        {archivosNuevos.contratoEditar.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {archivosNuevos.contratoEditar.map((f, i) => (
                                                    <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                        <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('contratoEditar', i)} title="Quitar archivo"></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {recursoActual.contrato_url && archivosNuevos.contratoEditar.length === 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                <span className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                    <span className="text-truncate" style={{maxWidth: "80%"}}>{limpiarNombreArchivo(recursoActual.contrato_url)}</span>
                                                    <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoUnico('contrato_url')} title="Eliminar este archivo"></i>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold d-block">Títulos</label>
                                        <label htmlFor="titulosEditar" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                        <input type="file" name="titulos" id="titulosEditar" className="d-none" multiple onChange={(e) => manejarSeleccionArchivos(e, 'titulosEditar')} />
                                        
                                        {archivosNuevos.titulosEditar.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {archivosNuevos.titulosEditar.map((f, i) => (
                                                    <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                        <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('titulosEditar', i)} title="Quitar archivo"></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {recursoActual.titulos && recursoActual.titulos.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {recursoActual.titulos.map((t, index) => (
                                                    <span key={index} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{limpiarNombreArchivo(t)}</span>
                                                        <i 
                                                            className="bi bi-x-circle-fill text-danger fs-6" 
                                                            style={{cursor: "pointer"}}
                                                            onClick={() => eliminarArchivoViejo('titulos', index)}
                                                            title="Eliminar este archivo"
                                                        ></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold d-block">Certificados</label>
                                        <label htmlFor="certificadosEditar" className="btn boton-accion text-white w-auto"><i className="bi bi-cloud-arrow-up-fill me-2"></i>Cargar Archivo</label>
                                        <input type="file" name="certificados" id="certificadosEditar" className="d-none" multiple onChange={(e) => manejarSeleccionArchivos(e, 'certificadosEditar')} />
                                        
                                        {archivosNuevos.certificadosEditar.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {archivosNuevos.certificadosEditar.map((f, i) => (
                                                    <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{f.name}</span>
                                                        <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => eliminarArchivoNuevo('certificadosEditar', i)} title="Quitar archivo"></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {recursoActual.certificados && recursoActual.certificados.length > 0 && (
                                            <div className="mt-2 d-flex flex-column gap-1">
                                                {recursoActual.certificados.map((c, index) => (
                                                    <span key={index} className="badge bg-white text-danger border border-danger text-start d-flex justify-content-between align-items-center p-2">
                                                        <span className="text-truncate" style={{maxWidth: "80%"}}>{limpiarNombreArchivo(c)}</span>
                                                        <i 
                                                            className="bi bi-x-circle-fill text-danger fs-6" 
                                                            style={{cursor: "pointer"}}
                                                            onClick={() => eliminarArchivoViejo('certificados', index)}
                                                            title="Eliminar este archivo"
                                                        ></i>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={guardarEdicionRecurso}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <-- MODAL ELIMINAR RECURSO --> */}
            <div className="modal fade" id="modalEliminarRecurso" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Eliminar Recurso</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body pt-3">
                            {recursoActual && (
                                <p>¿Estás seguro de que deseas eliminar al recurso <strong className="text-danger">{recursoActual.nombre} {recursoActual.apellido}</strong>?</p>
                            )}
                        </div>
                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn btn-danger" onClick={confirmarEliminarRecurso}>Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Recursos;