import { Outlet, NavLink } from 'react-router';
import './Sidebar.css'

const Sidebar = () => {

    const menuItems = [
        { nombre: 'Prestaciones', icono: 'bi-truck', url: '/prestaciones' },
        { nombre: 'Pacientes', icono: 'bi-people', url: '/pacientes' },
        { nombre: 'Recurso', src: '/images/doctor.png', url: '/recursos' },
        { nombre: 'Sueldos', icono: 'bi-wallet2', url: '/sueldos' },
        { nombre: 'Usuarios', icono: 'bi-person', url: '/usuarios' },
        { nombre: 'Caja', icono: 'bi-cash-coin', url: '/caja' },
        { nombre: 'Agenda', icono: 'bi-calendar-event', url: '/agenda' },
    ];
    
    return (
        <>  <div className="d-flex vh-100 w-100">
                <div className='conteneder-sidebar vh-100'>
                    <div className='conteneder-logo-sidebar'>
                        <img className='logo-kundalini-sidebar' src="//dcdn-us.mitiendanube.com/stores/002/707/544/themes/common/logo-535793582-1673018359-03b6bc19926ac505cabb1c4e27914dbf1673018360-480-0.png?0" alt="" />
                    </div>
                    <div className='contenedor-botones-sidebar'>
                        <div className='contenedor-botones-acciones'>
                            {menuItems.map((item, index) => (
                                <NavLink 
                                    to={item.url} 
                                    key={index} 
                                    className='btn boton-selector mb-2'
                                >
                                    {item.src ? (
                                        <img 
                                            src={item.src} 
                                            alt={item.nombre} 
                                            className="imagen-logo-boton me-2"
                                        />
                                    ) : (
                                        <i className={`bi ${item.icono} fs-4 me-2`}></i>
                                    )}
                                    {item.nombre}
                                </NavLink>
                            ))}
                        </div>
                        <div className='contenedor-botones-inferiores'>
                            <NavLink 
                                className='btn boton-selector'
                                to={'/mi-perfil'}
                            >
                                <i className='bi bi-person-circle fs-3 me-2'></i>
                                Mi Perfil
                            </NavLink>
                            <NavLink 
                                className='btn boton-selector'
                                to={'/'}
                            >
                                <i className='bi bi-box-arrow-right fs-3 me-2'></i>
                                Salir
                            </NavLink>
                        </div>
                    </div>
                </div>
                <div className="flex-grow-1 overflow-auto">
                    <Outlet />
                </div>
            </div>
        </>
    )
}

export default Sidebar;