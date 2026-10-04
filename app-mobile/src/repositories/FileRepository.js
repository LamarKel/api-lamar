import { FileService } from '../services/FileService';
import { Archivo } from '../models/Archivo';
export const FileRepository = {
  async subir(archivo, onProgress) { const { data } = await FileService.subir(archivo, onProgress); return Archivo.fromJson(data); },
};
