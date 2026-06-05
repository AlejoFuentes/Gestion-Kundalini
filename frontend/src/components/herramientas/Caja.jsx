import './Caja.css'
import { obtenerMovimientos } from '../../apis';
import { useEffect } from 'react';
import { useState } from 'react';

const Caja = () => {

    const [caja, setCaja] = useState([]);

    useEffect (() => {
        obtenerMovimientos().then(res => {
            setCaja(res.data);
        })
    },[]);

    if(!caja) {
        return(
            <div>
                Algo rompe en caja.
            </div>
        )
    }

    return (
        <div className="h-100">
            <h2>Movimientos de Caja</h2>
            <table className="table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Concepto</th>
                        <th>Importe</th>
                        <th>Proveedor</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Le clavamos el ? antes del map por pura seguridad */}
                    {caja?.map((mov) => (
                        <tr key={mov.id}>
                            <td>{mov.fecha}</td>
                            <td>{mov.tipo_movimiento}</td>
                            <td>{mov.concepto}</td>
                            <td>${mov.importe}</td>
                            <td>{mov.proveedor}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Caja;
