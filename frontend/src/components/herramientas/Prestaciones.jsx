import './Prestaciones.css'
import { useState, useEffect } from 'react'
import { obtenerPrestaciones, prestacionEdit } from '../../services/apis';
import { formatearFecha, formatearMoneda } from '../../services/utils';

const Prestaciones = () => {
    
    const [prestaciones, setPrestaciones] = useState([]);
    const [filtroActivo, setFiltroActivo] = useState('Todos');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [estado, setEstado] = useState('Todas');
    const [prestacionActual, setPrestacionActual] = useState('');

    const [loading, setLoading] = useState(true);
    
        useEffect (() => {
            setLoading(true);
            obtenerPrestaciones().then(res => {
                setPrestaciones(res);
                setLoading(false);
            })
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
        console.log("Prestacion eliminada: " + prestacionActual.id);
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
            <div className='container-fluid my-3 px-4 d-flex align-items-center gap-2'>
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
                <strong className="filtro-prestacion d-flex align-items-center shadow" style={{ fontSize: "14px"}}>Estado:&nbsp; 
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
                        <strong className='d-block'>Estado: <span className="fw-normal">{p.pagado ? "Pagada" : "Impaga"}</span></strong>
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

            {/* <-- MODAL EDITAR PRESTACIÓN --> */}
            <div className="modal fade" id="modalEditarPrestacion" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Editar Prestación #{prestacionActual?.id}</h5>
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

                                {/* --- FILA 3: Cantidad, Frecuencia y Estado --- */}
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
                                    <label className="form-label fw-bold">Frecuencia</label>
                                    <input 
                                        type="text" 
                                        name="frecuencia"
                                        className="form-control" 
                                        defaultValue={prestacionActual.frecuencia} 
                                        placeholder="Ej: 4xsem"
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label fw-bold">Estado</label>
                                    <select 
                                        className="form-select" 
                                        name="pagado"
                                        defaultValue={prestacionActual.pagado ? "true" : "false"}
                                    >
                                        <option value="true">Pagada</option>
                                        <option value="false">Impaga</option>
                                    </select>
                                </div>

                                {/* --- FILA 4: Valores Monetarios --- */}
                                <div className="col-md-6">
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

                                <div className="col-md-6">
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

                                {prestacionActual.detalles_extras && Object.keys(prestacionActual.detalles_extras).length > 0 && (
                                    <>
                                        <hr className="my-4" />
                                        <h6 className="fw-bold text-primary mt-0">Detalles Especificos</h6>
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
                            <button type="button" className="btn btn-primary" onClick={() => editarPrestacion()}>Guardar Cambios</button>
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