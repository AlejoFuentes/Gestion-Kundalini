import { useState, useEffect, useRef } from 'react';

const SelectorPaciente = ({ pacientes, pacienteSeleccionado, setPacienteSeleccionado }) => {
    
    const [busquedaPaciente, setBusquedaPaciente] = useState('');
    const [abierto, setAbierto] = useState(false);
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

    const pacientesParaDropdown = pacientes.filter(p => 
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(busquedaPaciente.toLowerCase())
    );

    return (
        <div className="position-relative" ref={dropdownRef}>
            <label className="form-label fw-bold">Paciente <span className="text-danger">*</span></label>
            <div 
                className="form-control d-flex justify-content-between align-items-center bg-white" 
                style={{ cursor: 'pointer', minHeight: '38px' }}
                onClick={() => setAbierto(!abierto)}
            >
                <span className={pacienteSeleccionado ? "text-dark" : "text-muted"} style={{ fontSize: '14px' }}>
                    {pacienteSeleccionado ? `${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido}` : "Seleccionar Paciente..."}
                </span>
                <i className={`bi bi-chevron-${abierto ? 'up' : 'down'}`}></i>
            </div>

            {abierto && (
                <div className="position-absolute w-100 bg-white border rounded shadow p-2 mt-1" style={{ zIndex: 1050, maxHeight: '250px', overflowY: 'auto' }}>
                    <input 
                        type="text" 
                        className="form-control mb-2" 
                        placeholder="Buscar paciente..." 
                        value={busquedaPaciente} 
                        onChange={(e) => setBusquedaPaciente(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        autoFocus
                    />
                    {pacientesParaDropdown.length > 0 ? (
                        pacientesParaDropdown.map(p => (
                            <div 
                                key={p.id} 
                                className="dropdown-item rounded px-2 py-1" 
                                style={{ cursor: 'pointer', fontSize: '14px' }}
                                onClick={() => {
                                    setPacienteSeleccionado(p);
                                    setAbierto(false);
                                    setBusquedaPaciente('');
                                }}
                            >
                                {p.nombre} {p.apellido}
                            </div>
                        ))
                    ) : (
                        <div className="text-muted text-center py-2 small">No se encontraron pacientes</div>
                    )}
                </div>
            )}
            <input type="hidden" name="paciente_id" value={pacienteSeleccionado?.id || ''} required />
        </div>
    );
};

export default SelectorPaciente;