import { Routes, Route } from 'react-router';
import Sidebar from './components/formulario/Sidebar.jsx';
import Login from './components/formulario/Login.jsx';
import Perfil from './components/formulario/Perfil.jsx';
import Prestaciones from './components/herramientas/Prestaciones.jsx';
import Sueldos from './components/proximamente/Sueldos.jsx';
import Caja from './components/proximamente/Caja.jsx';
import Usuarios from './components/proximamente/Usuarios.jsx';
import Agenda from './components/proximamente/Agenda.jsx';
import Pacientes from './components/herramientas/Pacientes.jsx';
import Recursos from './components/herramientas/Recursos.jsx';

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
          <Route path='/pacientes' element={<Pacientes/>} />
          <Route path='/recursos' element={<Recursos/>} />
          <Route path='/agenda' element={<Agenda/>} />
          <Route path='/mi-perfil' element={<Perfil/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
