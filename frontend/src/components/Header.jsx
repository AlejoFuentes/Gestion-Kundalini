import { Outlet } from 'react-router';
import './Header.css'

const Header = () => {
    return (
        <>
            <div className='conteneder-header'>
                <div className='conteneder-logo-header col-3'>
                    <img className='logo-kundalini-header' src="//dcdn-us.mitiendanube.com/stores/002/707/544/themes/common/logo-535793582-1673018359-03b6bc19926ac505cabb1c4e27914dbf1673018360-480-0.png?0" alt="" />
                </div>
                <div className='col-3'></div>
                <div className='col-3 contenedor-botones-header'>
                    <button className='btn fs-3 me-2'><i className='bi bi-person-circle'></i></button>
                    <button className='btn fs-3 me-5'><i className='bi bi-box-arrow-right'></i></button>
                </div>
            </div>
            <div>
                <Outlet />
            </div>
        </>
    )
}

export default Header;