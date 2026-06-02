import { Outlet, NavLink } from 'react-router';
import './Sidebar.css'

const Sidebar = () => {

    const menuItems = [
        { nombre: 'Prestaciones', icono: 'bi-truck', url: '/panel' },
        { nombre: 'Sueldos', icono: 'bi-wallet2', url: '/' },
        { nombre: 'Caja', icono: 'bi-cash-coin', url: '/' },
        { nombre: 'Usuarios', icono: 'bi-people', url: '/' },
        { nombre: 'Agenda', icono: 'bi-calendar-event', url: '/' }
    ];
    
    return (
        <>
            <div className='conteneder-sidebar'>
                <div className='conteneder-logo-sidebar'>
                    <img className='logo-kundalini-sidebar' src="//dcdn-us.mitiendanube.com/stores/002/707/544/themes/common/logo-535793582-1673018359-03b6bc19926ac505cabb1c4e27914dbf1673018360-480-0.png?0" alt="" />
                </div>
                <div className='contenedor-botones-sidebar'>
                    <div className='contenedor-botones-acciones'>
                        {menuItems.map((item, index) => (
                            <NavLink 
                                to={item.url} 
                                key={index} 
                                className='btn boton-sidebar text-start mb-2'
                            >
                                <i className={`bi ${item.icono} fs-4 me-2`}></i>
                                {item.nombre}
                            </NavLink>
                        ))}
                    </div>
                    <div className='contenedor-botones-inferiores'>
                        <button className='btn boton-sidebar'>
                            <i className='bi bi-person-circle fs-3 me-2'></i>
                            Mi Perfil
                        </button>
                        <button className='btn boton-sidebar'>
                            <i className='bi bi-box-arrow-right fs-3 me-2'></i>
                            Salir
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default Sidebar;