import './Prestaciones.css'
import { useState, useEffect } from 'react'
import { obtenerPrestaciones, prestacionEdit, crearPrestacion, eliminarPrestacion, obtenerPacientes } from '../../services/apis';
import { formatearFecha, formatearMoneda, formatearHorario } from '../../services/utils';

const Prestaciones = () => {
    
    const [prestaciones, setPrestaciones] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('Todos');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estado, setEstado] = useState('Todas');
    const [prestacionActual, setPrestacionActual] = useState('');

    const [loading, setLoading] = useState(true);

    
    const [pacientes, setPacientes] = useState([]);
    const [busquedaPaciente, setBusquedaPaciente] = useState('');
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    
    const pacientesParaDropdown = pacientes.filter(p => 
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(busquedaPaciente.toLowerCase())
    );

    const [nuevoPrestador, setNuevoPrestador] = useState('');
    const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');
    
        useEffect (() => {
            setLoading(true);
                
            Promise.all([
                obtenerPrestaciones(),
                obtenerPacientes()
            ]).then(([resPrestaciones, resPacientes]) => {
                setPrestaciones(resPrestaciones);
                setPacientes(resPacientes); 
                setLoading(false);
            });
        },[]);
    
    const accionesBotones = [

        { nombre: "Editar Prestación", 
          icono: "bi bi-pencil-square",
          color: "rgb(165, 22, 22)",
          accion: (p) => {
            setPrestacionActual(p);
          },
          modalTarget: "#modalEditarPrestacion"
        },

        { nombre: "Duplicar Prestación", 
          icono: "bi bi-back",
          color: "rgb(8, 6, 6)",
        //   accion: (f) => {
        //     setFacturaActual(f);
        //     setNumeroSeleccionado("2");
        //     setMesSeleccionado(`${String(f.mes).slice(0, 4)}-${String(f.mes).slice(4)}`)
        //   },
        //   mostrar: (f) => !f.numero,
        //   modalTarget: "#modalDividirFactura"
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

    const prestadoresUnicos = ['Todos', ...new Set(prestaciones?.map(p => p.prestador))];

    const guardarNuevaPrestacion = () => {
        const form = document.getElementById('formCrearPrestacion');
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        if (!pacienteSeleccionado) {
            alert("Por favor, seleccioná un paciente de la lista.");
            return;
        }

        const formData = new FormData(form);
        const datosForm = Object.fromEntries(formData.entries());

        const camposPrincipales = [
            'paciente_id', 'prestador', 'especialidad', 'fecha_inicio', 'fecha_fin',
            'cantidad', 'valor', 'total', 'frecuencia', 'horario', 'estado', 'pagado', 'observaciones'
        ];

        let detalles_extras = {};
        let datosAEnviar = {};

        Object.keys(datosForm).forEach(key => {
            if (camposPrincipales.includes(key)) {
                datosAEnviar[key] = datosForm[key];
            } else {
                if (datosForm[key] !== '') {
                    detalles_extras[key] = datosForm[key];
                }
            }
        });

        datosAEnviar.detalles_extras = detalles_extras;

        crearPrestacion(datosAEnviar)
            .then(() => {
                obtenerPrestaciones().then(res => setPrestaciones(res));

                document.querySelector('#modalCrearPrestacion .btn-close').click();

                form.reset();
                setNuevoPrestador('');
                setNuevaEspecialidad('');
                setPacienteSeleccionado(null);
                setBusquedaPaciente('');
            })
            .catch(error => {
                alert("Hubo un error al crear la prestación. Revisá la consola.");
            });
    }

    const editarPrestacion = () => {
        if (!prestacionActual) return;

        const form = document.getElementById('formEditarPrestacion');
        const formData = new FormData(form);
        const datosForm = Object.fromEntries(formData.entries());

        let detallesActualizados = {};
        if (prestacionActual.detalles_extras) {
            Object.keys(prestacionActual.detalles_extras).forEach(clave => {
                detallesActualizados[clave] = datosForm[clave];
                delete datosForm[clave]; 
            });
        }

        const datosAEnviar = {
            ...datosForm,
            detalles_extras: detallesActualizados
        };

        prestacionEdit(prestacionActual.id, datosAEnviar)
            .then(() => {
                obtenerPrestaciones().then(res => setPrestaciones(res));

                document.querySelector('#modalEditarPrestacion .btn-close').click();
                setPrestacionActual(null);
            })
            .catch(error => {
                alert("Hubo un error al guardar los cambios.");
            });
    }

    const handleEliminarPrestacion = () => {
        if (!prestacionActual) return;

        eliminarPrestacion(prestacionActual.id)
            .then(() => {
                obtenerPrestaciones().then(res => setPrestaciones(res));

                document.querySelector('#modalEliminarPrestacion .btn-close').click();
                setPrestacionActual(null);
            })
            .catch(error => {
                alert("Hubo un error al eliminar la prestación. Revisá la consola.");
            });
    }

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
            <div className='container-fluid my-3 px-4 d-flex align-items-center justify-content-between gap-2'>
                <div className='d-flex align-items-center gap-2'>
                    
                
                <strong className="filtro-prestacion shadow" style={{ fontSize: "14px"}}>Fecha desde:&nbsp; 
                    <input 
                        className='input-filtro'
                        type="date"
                        value={fechaDesde}
                        onChange={(e) => setFechaDesde(e.target.value)} 
                    />
                </strong>
                <strong className="filtro-prestacion shadow" style={{ fontSize: "14px"}}>Fecha hasta:&nbsp; 
                    <input 
                        className='input-filtro'
                        type="date"
                        value={fechaHasta}
                        onChange={(e) => setFechaHasta(e.target.value)} 
                    />
                </strong>
                <strong className="filtro-prestacion d-flex align-items-center shadow" style={{ fontSize: "14px"}}>Deuda: 
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
                </strong>
                </div>
                <div className='btn boton-accion align-items-center d-flex gap-1' data-bs-toggle="modal" data-bs-target="#modalCrearPrestacion">
                    <i className="bi bi-plus-circle me-1"></i> Crear nueva prestación 
                </div>
            </div>

            {/* <-- LISTA --> */}
            <ul className="list-group gap-3 mb-5">
                {loading ? (
                    <div className='h-100 d-flex justify-content-center align-items-center'>
                        <div className='spinner-border text-primary m-5' role='status'></div>
                    </div>
                ) :
                prestacionesFiltradas && prestacionesFiltradas.length > 0 ? (
            prestacionesFiltradas.map(p => (
                <li className='list-group-item d-flex row mx-4 p-4 rounded-3 shadow' key={p.id}>
                    {/* <-- COLUMNA 1 --> */}
                    <div className='col-2 border-end'>
                        <strong className='d-block mb-2'>Prestador: <span className="fw-normal">{p.prestador}</span></strong>
                        <strong className='d-block'>Id Prestación: <span className="fw-normal">{p.id}</span></strong>
                        <strong className='d-block'>Fecha Inicio: <span className="fw-normal">{formatearFecha(p.fecha_inicio)}</span></strong>
                        <strong className='d-block'>Fecha Fin: <span className="fw-normal">{p.fecha_fin? formatearFecha(p.fecha_fin) : "- -"}</span></strong>
                        {p.horario && (
                            <strong className='d-block'>Horario: <span className="fw-normal">{formatearHorario(p.horario)}</span></strong>
                        )}
                        <strong className='d-block'>Especialidad: <span className="fw-normal">{p.especialidad}</span></strong>
                        {p.detalles_extras?.movil && (
                        <strong className='d-block'>Móvil asignado: <span className="fw-normal">{p.detalles_extras.movil}</span></strong>
                        )}
                        {p.detalles_extras?.turno && (
                        <strong className='d-block'>Turno: <span className="fw-normal">{p.detalles_extras.turno}</span></strong>
                        )}
                        {p.detalles_extras?.centro_medico && (
                        <strong className='d-block'>Centro: <span className="fw-normal">{p.detalles_extras.centro_medico}</span></strong>
                        )}
                    </div>
                    {/* <-- COLUMNA 2 --> */}
                    <div className='col-3 border-end d-flex flex-column justify-content-center'>
                        <strong className='d-block mb-2'>Paciente: <span className="fw-normal">{p.paciente.nombre} {p.paciente.apellido}</span></strong>
                        <strong className='d-block'>Fecha Nac: <span className="fw-normal">{formatearFecha(p.paciente.fecha_nacimiento)}</span></strong>
                        <strong className='d-block'>Diagnóstico: <span className="fw-normal">{p.paciente.diagnostico}</span></strong>
                        <strong className='d-block'>Dirección: <span className="fw-normal">{p.paciente.direccion}</span></strong>
                        <strong className='d-block'>Localidad: <span className="fw-normal">{p.paciente.localidad}</span></strong>
                    </div>
                    {/* <-- COLUMNA 3 --> */}
                    <div className='col-2 border-end d-flex flex-column justify-content-center'>
                        <strong className='d-block'>Cantidad: <span className="fw-normal">{p.cantidad}</span></strong>
                        <strong className='d-block'>Frecuencia: <span className="fw-normal">{p.frecuencia}</span></strong>
                        <strong className='d-block'>Valor: <span className="fw-normal">${formatearMoneda(p.valor)}</span></strong>
                        <strong className='d-block'>Total: <span className="fw-normal">${formatearMoneda(p.total)}</span></strong>
                        <strong className='d-block'>Deuda: <span className="fw-normal">{p.pagado ? "Pagada" : "Impaga"}</span></strong>
                        <strong className='d-block'>Estado: <span className="fw-normal">{p.estado}</span></strong>
                    </div>
                    {/* <-- COLUMNA 4 --> */}
                    <div className='row col-4 d-flex border-end'>
                        <div className='col-6'>
                            {p.detalles_extras?.hs_doble && p.detalles_extras?.valor_hs_doble && (
                                <>
                                    <strong className='d-block border-end'>Cant hs dobles: <span className="fw-normal">{p.detalles_extras.hs_doble}</span></strong>
                                    <strong className='d-block border-end'>Valor hs dobles: <span className="fw-normal">${formatearMoneda(p.detalles_extras.valor_hs_doble)}</span></strong>
                                </>
                            )}
                            {p.detalles_extras?.hs_extra && p.detalles_extras?.valor_hs_extra && (
                                <>
                                    <strong className='d-block border-end'>Cant hs extra: <span className="fw-normal">{p.detalles_extras.hs_extra}</span></strong>
                                    <strong className='d-block border-end'>Valor hs extra: <span className="fw-normal">${formatearMoneda(p.detalles_extras.valor_hs_extra)}</span></strong>
                                </>
                            )}

                        </div>
                        {/* <-- COLUMNA 5 --> */}
                        <div className='col-6 mb-2'>
                            {p.detalles_extras?.hs_feriado && p.detalles_extras?.valor_hs_feriado && (
                                <>
                                    <strong className='d-block'>Cant hs feriado: <span className="fw-normal">{p.detalles_extras.hs_feriado}</span></strong>
                                    <strong className='d-block'>Valor hs feriado: <span className="fw-normal">${formatearMoneda(p.detalles_extras.valor_hs_feriado)}</span></strong>
                                </>
                            )}
                            {p.detalles_extras?.hs_e_f && p.detalles_extras?.valor_hs_e_f && (
                                <>
                                    <strong className='d-block'>Cant hs e+f: <span className="fw-normal">{p.detalles_extras.hs_e_f}</span></strong>
                                    <strong className='d-block'>Valor hs e+f: <span className="fw-normal">${formatearMoneda(p.detalles_extras.valor_hs_e_f)}</span></strong>
                                </>
                            )}
                        </div>
                        <strong className='d-block col-12'>Observaciones: <span className="fw-normal">{p.observaciones}</span></strong>
                    </div>
                    {/* <-- COLUMNA 5 --> */}
                    <div className='col-1 d-flex flex-column align-items-end'>
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
                ))) : (
                    
                    <li className= 'list-group-item text-center text-muted mx-3'> No hay resultados. </li>
                    
                )
            }
        </ul>

        {/* <-- MODAL CREAR PRESTACIÓN --> */}
            <div className="modal fade" id="modalCrearPrestacion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header border-bottom-1 pb-3">
                            <h5 className="modal-title fs-5">Crear Nueva Prestación</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body pt-3">
                            <form className="row g-3" id="formCrearPrestacion">

                                {/* --- DATOS PRINCIPALES --- */}
                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2">Datos Generales</h6>
                                        
                                {/* Fila 1: Prestador, Especialidad, Paciente */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Prestador <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select" 
                                        name="prestador" 
                                        required
                                        value={nuevoPrestador}
                                        onChange={(e) => setNuevoPrestador(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Pablo">Pablo</option>
                                        <option value="Salud del Valle">Salud del Valle</option>
                                        <option value="Bariss Salud">Bariss Salud</option>
                                        <option value="Privado">Privado</option>
                                    </select>
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Especialidad <span className="text-danger">*</span></label>
                                    <select 
                                        className="form-select" 
                                        name="especialidad" 
                                        required
                                        value={nuevaEspecialidad}
                                        onChange={(e) => setNuevaEspecialidad(e.target.value)}
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="Traslado">Traslado</option>
                                        <option value="Enfermería">Enfermería</option>
                                        <option value="Dialisis">Diálisis</option>
                                    </select>
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Paciente <span className="text-danger">*</span></label>
                                    <div className="dropdown">
                                        <button className="form-select text-start" data-bs-toggle="dropdown" type="button">
                                            {pacienteSeleccionado ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}` : "Seleccionar Paciente..."}
                                        </button>
                                        <ul className="dropdown-menu w-100 p-2 shadow" style={{maxHeight: '250px', overflowY: 'auto'}}>
                                            <input 
                                                type="text" 
                                                className="form-control mb-2" 
                                                placeholder="Buscar paciente..." 
                                                value={busquedaPaciente} 
                                                onChange={(e) => setBusquedaPaciente(e.target.value)} 
                                            />
                                            {pacientesParaDropdown.length > 0 ? (
                                                pacientesParaDropdown.map(p => (
                                                    <li key={p.id}>
                                                        <button 
                                                            className="dropdown-item rounded" 
                                                            type="button" 
                                                            onClick={() => setPacienteSeleccionado(p)}
                                                        >
                                                            {p.nombre} {p.apellido}
                                                        </button>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-muted text-center py-2">No se encontraron pacientes</li>
                                            )}
                                        </ul>
                                        <input type="hidden" name="paciente_id" value={pacienteSeleccionado?.id || ''} required />
                                    </div>
                                </div>
                                        
                                {/* Fila 2: Recurso, Fechas */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Recurso</label>
                                    <input type="text" name="recurso" className="form-control" placeholder="Persona a cargo..." />
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Fecha Inicio <span className="text-danger">*</span></label>
                                    <input type="date" name="fecha_inicio" className="form-control" required />
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Fecha Fin</label>
                                    <input type="date" name="fecha_fin" className="form-control" />
                                </div>
                                        
                                        
                                {/* Fila 3: Valores Monetarios y Cantidad */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Cantidad</label>
                                    <input type="number" name="cantidad" className="form-control" />
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Valor (Unitario)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input type="number" step="0.01" name="valor" className="form-control" />
                                    </div>
                                </div>
                                        
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Total</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input type="number" step="0.01" name="total" className="form-control" />
                                    </div>
                                </div>
                                {/* Fila 4: Horario, Estado, Deuda, Frecuencia */}
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Frecuencia</label>
                                    <input type="text" name="frecuencia" className="form-control" placeholder="Ej: 3xsem" />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Horario</label>
                                    <input type="time" name="horario" className="form-control" />
                                </div>
                                        
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Estado</label>
                                    <select className="form-select" name="estado" defaultValue="Sin asignar">
                                        <option value="Sin asignar">Sin asignar</option>
                                        <option value="Asignado">Asignado</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>
                                        
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Deuda</label>
                                    <select className="form-select" name="pagado" defaultValue="false">
                                        <option value="true">Pagada</option>
                                        <option value="false">Impaga</option>
                                    </select>
                                </div>
                                        

                                <h6 className="fw-bold text-danger mb-0 mt-4 border-bottom pb-2" style={{color: 'var(--color-primario)'}}>Datos Particulares</h6>

                                {/* Solo si la especialidad es Traslado */}
                                {nuevaEspecialidad === 'Traslado' && (
                                    <>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Móvil</label>
                                            <select className="form-select" name="movil">
                                                <option value="">-</option>
                                                <option value="k1">k1</option>
                                                <option value="k2">k2</option>
                                                <option value="k3">k3</option>
                                                <option value="k4">k4</option>
                                            </select>
                                        </div>
                                        <div className="col-md-4">
                                            <label className="form-label fw-bold">Centro Médico</label>
                                            <input type="text" name="centro_medico" className="form-control" />
                                        </div>
                                    </>
                                )}

                                {/* Privado */}
                                {nuevoPrestador === 'Privado' && (
                                    <div className="col-md-4">
                                        <label className="form-label fw-bold">Turno</label>
                                        <input type="text" name="turno" className="form-control" />
                                    </div>
                                )}

                                {/* Bariss Salud o Privado (Comparten Feriado) */}
                                {(nuevoPrestador === 'Bariss Salud' || nuevoPrestador === 'Privado') && (
                                    <>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Hs Feriado</label>
                                            <input type="number" name="hs_feriado" className="form-control" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Valor Hs Feriado</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input type="number" step="0.01" name="valor_hs_feriado" className="form-control" />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Solo Bariss Salud */}
                                {nuevoPrestador === 'Bariss Salud' && (
                                    <>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Hs Extra</label>
                                            <input type="number" name="hs_extra" className="form-control" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Valor Hs Extra</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input type="number" step="0.01" name="valor_hs_extra" className="form-control" />
                                            </div>
                                        </div>

                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Hs Doble</label>
                                            <input type="number" name="hs_doble" className="form-control" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Valor Hs Doble</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input type="number" step="0.01" name="valor_hs_doble" className="form-control" />
                                            </div>
                                        </div>
                                
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Hs E+F</label>
                                            <input type="number" name="hs_e_f" className="form-control" />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label fw-bold">Valor Hs E+F</label>
                                            <div className="input-group">
                                                <span className="input-group-text">$</span>
                                                <input type="number" step="0.01" name="valor_hs_e_f" className="form-control" />
                                            </div>
                                        </div>
                                    </>
                                )}
                                        
                                <div className="col-12 mt-4">
                                    <label className="form-label fw-bold">Observaciones</label>
                                    <textarea className="form-control" rows="2" name="observaciones"></textarea>
                                </div>
                                        
                            </form>
                        </div>
                                        
                        <div className="modal-footer border-top-0 pt-0 mt-3">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={guardarNuevaPrestacion}>Guardar Prestación</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* <-- MODAL EDITAR PRESTACIÓN --> */}
            <div className="modal fade" id="modalEditarPrestacion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Prestación <span className="text-danger fs-5">#{prestacionActual?.id}</span></h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>

                        <div className="modal-body">
                            {prestacionActual && (
                                <form className="row g-3" id="formEditarPrestacion" key={JSON.stringify(prestacionActual)}>
                                                            
                                {/* --- FILA 1: Prestador y Especialidad --- */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Prestador</label>
                                    <select 
                                        className="form-select" 
                                        name="prestador"
                                        defaultValue={prestacionActual.prestador}
                                    >
                                        <option value="Pablo">Pablo</option>
                                        <option value="Salud del Valle">Salud del Valle</option>
                                        <option value="Bariss Salud">Bariss Salud</option>
                                        <option value="Privado">Privado</option>
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Especialidad</label>
                                    <select 
                                        className="form-select" 
                                        name="especialidad"
                                        defaultValue={prestacionActual.especialidad}
                                    >
                                        <option value="Traslado">Traslado</option>
                                        <option value="Enfermería">Enfermería</option>
                                        <option value="Dialisis">Diálisis</option>
                                    </select>
                                </div>

                                {/* --- FILA 2: Fechas --- */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Fecha Inicio</label>
                                    <input 
                                        type="date" 
                                        name="fecha_inicio"
                                        className="form-control" 
                                        defaultValue={prestacionActual.fecha_inicio ? prestacionActual.fecha_inicio.slice(0, 10) : ""} 
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Fecha Fin</label>
                                    <input 
                                        type="date" 
                                        name="fecha_fin"
                                        className="form-control" 
                                        defaultValue={prestacionActual.fecha_fin ? prestacionActual.fecha_fin.slice(0, 10) : ""} 
                                    />
                                </div>

                                {/* --- FILA 3: Valores Monetarios y Cantidad --- */}
                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Cantidad</label>
                                    <input 
                                        type="number" 
                                        name="cantidad"
                                        className="form-control" 
                                        defaultValue={prestacionActual.cantidad} 
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Valor (Unitario)</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            name="valor"
                                            className="form-control" 
                                            defaultValue={prestacionActual.valor} 
                                        />
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Total</label>
                                    <div className="input-group">
                                        <span className="input-group-text">$</span>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            name="total"
                                            className="form-control" 
                                            defaultValue={prestacionActual.total} 
                                        />
                                    </div>
                                </div>

                                {/* --- FILA 4: Frecuencia, Horario, Estado, Deuda --- */}
                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Frecuencia</label>
                                    <input 
                                        type="text" 
                                        name="frecuencia"
                                        className="form-control" 
                                        defaultValue={prestacionActual.frecuencia} 
                                        placeholder="Ej: 4xsem"
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Horario</label>
                                    <input 
                                        type="time" 
                                        name="horario"
                                        className="form-control" 
                                        defaultValue={prestacionActual.horario || ""} 
                                    />
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Estado</label>
                                    <select 
                                        className="form-select" 
                                        name="estado"
                                        defaultValue={prestacionActual.estado || "Sin asignar"}
                                    >
                                        <option value="Sin asignar">Sin asignar</option>
                                        <option value="Asignado">Asignado</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </select>
                                </div>

                                <div className="col-md-3">
                                    <label className="form-label fw-bold">Deuda</label>
                                    <select 
                                        className="form-select" 
                                        name="pagado"
                                        defaultValue={prestacionActual.pagado ? "true" : "false"}
                                    >
                                        <option value="true">Pagada</option>
                                        <option value="false">Impaga</option>
                                    </select>
                                </div>
                                {prestacionActual.detalles_extras && Object.keys(prestacionActual.detalles_extras).length > 0 && (
                                    <>
                                        <hr className="my-4" />
                                        <h6 className="fw-bold text-danger mt-0">Detalles Especificos</h6>
                                        {Object.entries(prestacionActual.detalles_extras).map(([clave, valor]) => (
                                            <div className="col-md-4" key={clave}>
                                                <label className="form-label text-capitalize fw-bold">
                                                    {clave.replace(/_/g, ' ')}
                                                </label>
                                                {clave.includes('valor') ? (
                                                    <div className="input-group">
                                                        <span className="input-group-text">$</span>
                                                        <input 
                                                            type="number" 
                                                            step="0.01"
                                                            name={clave}
                                                            className="form-control" 
                                                            defaultValue={valor} 
                                                        />
                                                    </div>
                                                ) : (
                                                    <input 
                                                        type={clave.includes('hs') || clave.includes('cant') ? "number" : "text"}
                                                        name={clave}
                                                        className="form-control" 
                                                        defaultValue={valor} 
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* --- FILA FINAL: Observaciones --- */}
                                <div className="col-12 mt-4">
                                    <label className="form-label fw-bold">Observaciones</label>
                                    <textarea 
                                        className="form-control" 
                                        rows="2" 
                                        name="observaciones"
                                        defaultValue={prestacionActual.observaciones}
                                    ></textarea>
                                </div>
                            
                            </form>
                            )}
                        </div>
                        
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" className="btn boton-accion" onClick={() => editarPrestacion()}>Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Modal Eliminar PRESTACION */}
            <div className="modal fade" id="modalEliminarPrestacion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-sm">
                    <div className="modal-content">
                        <div className="modal-header border-0 pb-0">
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body text-center pb-4 pt-0">
                            <i className="bi bi-exclamation-circle text-danger mb-2" style={{fontSize: '3.5rem'}}></i>
                            <h5 className="mt-2 fw-bold">¿Estás seguro de que querés eliminar esta prestación?</h5>
                            <p className="text-muted" style={{fontSize: '14px'}}>
                                Vas a eliminar esta prestación. Esta acción no se puede deshacer.
                            </p>
                            <div className="d-flex justify-content-center gap-2 mt-4">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                                <button type="button" className="btn btn-danger" onClick={handleEliminarPrestacion}>Sí, eliminar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Prestaciones;