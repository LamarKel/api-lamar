import { http } from './HttpClient';
export const FileService = {
  // multipart/form-data con progreso
  subir: (archivo, onProgress) => {
    const form = new FormData();
    form.append('file', { uri: archivo.uri, name: archivo.name, type: archivo.mimeType || 'application/octet-stream' });
    return http.post('/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => e.total && onProgress(Math.round((e.loaded * 100) / e.total)),
    });
  },
  listar: () => http.get('/api/archivos'),
};
