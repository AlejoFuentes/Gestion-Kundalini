import { Routes, Route } from 'react-router';
import Sidebar from './components/formulario/Sidebar.jsx';
import Login from './components/formulario/Login.jsx';
import Perfil from './components/formulario/Perfil.jsx';
import Prestaciones from './components/herramientas/Prestaciones.jsx';
import Sueldos from './components/herramientas/Sueldos.jsx';
import Caja from './components/herramientas/Caja.jsx';
import Usuarios from './components/herramientas/Usuarios.jsx';
import Agenda from './components/herramientas/Agenda.jsx';

const App = () => {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route element={<Sidebar/>}>
          {/* <Route path='/' element={<Login/>} /> */}
          <Route path='/prestaciones' element={<Prestaciones/>} />
          <Route path='/sueldos' element={<Sueldos/>} />
          <Route path='/caja' element={<Caja/>} />
          <Route path='/usuarios' element={<Usuarios/>} />
          <Route path='/agenda' element={<Agenda/>} />
          <Route path='/mi-perfil' element={<Perfil/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
