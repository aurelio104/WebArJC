// Declaración de módulo vacío para evitar errores de tipado con 'canvas'
declare module 'canvas' {
  const noop: any;
  export = noop;
}
