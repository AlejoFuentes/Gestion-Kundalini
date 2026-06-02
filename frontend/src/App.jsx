import { Routes, Route } from 'react-router';
import Panel from './components/Panel.jsx';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';

const App = () => {

  return (
    <>
      <Routes>
        <Route path='/' element={<Login/>} />
        <Route element={<Header/>}>
          {/* <Route path='/' element={<Login/>} /> */}
          <Route path='/panel' element={<Panel/>} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
