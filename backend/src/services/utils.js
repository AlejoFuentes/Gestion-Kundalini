export const limpiar = (val) => (val === undefined || val === null || String(val).trim() === '') ? null : val;

export const obtenerRutaArchivo = (file) => {
    if (!file) return null;
    return `/uploads/${file.filename}`;
};