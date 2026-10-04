export class Archivo {
  constructor({ id, nombreOriginal, url, tipo, tamano, fechaSubida }) {
    Object.assign(this, { id, nombreOriginal, url, tipo, tamano, fechaSubida });
  }
  get esImagen() { return (this.tipo || '').startsWith('image/'); }
  static fromJson(json) { return new Archivo(json); }
}
