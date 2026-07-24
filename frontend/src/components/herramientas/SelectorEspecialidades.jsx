import { useState, useEffect, useRef } from 'react';
import { crearEspecialidad, eliminarEspecialidadGlobal } from '../../services/apis.js';

export const SelectorEspecialidades = ({ especialidadesGlobales, especialidadesSeleccionadas, setEspecialidadesSeleccionadas, recargarCatalogo }) => {
    const [abierto, setAbierto] = useState(false);
    const [nuevaEsp, setNuevaEsp] = useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setAbierto(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleCheckbox = (nombre) => {
        if (especialidadesSeleccionadas.includes(nombre)) {
            setEspecialidadesSeleccionadas(especialidadesSeleccionadas.filter(e => e !== nombre));
        } else {
            setEspecialidadesSeleccionadas([...especialidadesSeleccionadas, nombre]);
        }
    };

    const quitarBadge = (nombre) => {
        setEspecialidadesSeleccionadas(especialidadesSeleccionadas.filter(e => e !== nombre));
    };

    const handleAgregarGlobal = async (e) => {
        e.preventDefault();
        if (!nuevaEsp.trim()) return;
        try {
            await crearEspecialidad(nuevaEsp.trim());
            setNuevaEsp('');
            recargarCatalogo();
        } catch (error) {
            alert(error.response?.data?.error || 'Error al crear la especialidad');
        }
    };

    const handleEliminarGlobal = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm("¿Seguro querés eliminar esta especialidad del sistema?")) return;
        try {
            await eliminarEspecialidadGlobal(id);
            recargarCatalogo();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    return (
        <div className="position-relative" ref={dropdownRef}>
            <label className="form-label fw-bold">Especialidades</label>
            
            <div 
                className="form-control d-flex justify-content-between align-items-center bg-white" 
                style={{ cursor: 'pointer', minHeight: '38px' }}
                onClick={() => setAbierto(!abierto)}
            >
                <span className="text-muted" style={{ fontSize: '14px' }}>
                    {especialidadesSeleccionadas.length > 0 
                        ? `${especialidadesSeleccionadas.length} seleccionada(s)` 
                        : 'Seleccionar especialidades...'}
                </span>
                <i className={`bi bi-chevron-${abierto ? 'up' : 'down'}`}></i>
            </div>

            {especialidadesSeleccionadas.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-1">
                    {especialidadesSeleccionadas.map((esp, i) => (
                        <span key={i} className="badge bg-white text-danger border border-danger text-start d-flex align-items-center gap-2 p-2">
                            <span>{esp}</span>
                            <i className="bi bi-x-circle-fill text-danger fs-6" style={{cursor: "pointer"}} onClick={() => quitarBadge(esp)} title="Quitar"></i>
                        </span>
                    ))}
                </div>
            )}

            {abierto && (
                <div className="position-absolute w-100 bg-white border rounded shadow p-2 mt-1" style={{ zIndex: 1050, maxHeight: '220px', overflowY: 'auto' }}>
                    {especialidadesGlobales.length === 0 ? (
                        <p className="text-muted text-center m-2 small">No hay especialidades cargadas.</p>
                    ) : (
                        especialidadesGlobales.map(item => (
                            <div key={item.id} className="d-flex justify-content-between align-items-center px-2 py-1" style={{ fontSize: '14px' }}>
                                <div className="form-check m-0">
                                    <input 
                                        className="form-check-input checkbox-rojo" 
                                        type="checkbox" 
                                        checked={especialidadesSeleccionadas.includes(item.nombre)}
                                        onChange={() => toggleCheckbox(item.nombre)}
                                        id={`esp-${item.id}`}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <label className="form-check-label ms-2" htmlFor={`esp-${item.id}`} style={{ cursor: 'pointer' }}>
                                        {item.nombre}
                                    </label>
                                </div>
                                <i 
                                    className="bi bi-trash3 fs-5 text-danger" 
                                    style={{ cursor: 'pointer' }} 
                                    title="Eliminar del sistema"
                                    onClick={(e) => handleEliminarGlobal(e, item.id)}
                                ></i>
                            </div>
                        ))
                    )}

                    <hr className="my-2" />
                    
                    <div className="input-group input-group-sm">
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Nueva especialidad..." 
                            value={nuevaEsp} 
                            onChange={(e) => setNuevaEsp(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button className="btn boton-accion text-white" type="button" onClick={handleAgregarGlobal}>
                            <i className="bi bi-plus"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};