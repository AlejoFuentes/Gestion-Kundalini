export const formatearMoneda = (valor) => {
    if (!valor) return "0,00"; 
    return Number(valor).toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const formatearFecha = (date) =>{
    return new Date(date).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC"
    }).replace(", ", " - ")
};

export const formatearHorario = (horario) => {
    return horario.slice(0, 5);
}

export const borrarTildes = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

export const mostrarLista = (lista) => {
    return lista && lista.length > 0 ? lista.join(' / ') : '- -';
};

export const verificarCampo = (texto) => {
    return texto ? texto : '- -';
};

export const formatearURLArchivo = (url) => {
    return url ? url.split('/').pop() : '';
};

export const obtenerURLCompleta = (urlArchivo) => {
    if (!urlArchivo) return '#';
    if (urlArchivo.startsWith('http')) return urlArchivo;
    const rutaLimpia = urlArchivo.startsWith('/') ? urlArchivo : `/${urlArchivo}`;
    return `http://localhost:3000${rutaLimpia}`;
};

export const mostrarNombresRecursos = (recursosObj) => {
    if (!recursosObj || recursosObj.length === 0) return "- -";
    return recursosObj.map(r => r.nombre).join(' | ');
};