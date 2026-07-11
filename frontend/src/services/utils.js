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