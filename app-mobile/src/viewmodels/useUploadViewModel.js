import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { FileRepository } from '../repositories/FileRepository';

export function useUploadViewModel() {
  const [archivo, setArchivo] = useState(null);   // { uri, name, mimeType, size }
  const [progreso, setProgreso] = useState(0);
  const [subiendo, setSubiendo] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  const reset = () => { setProgreso(0); setResultado(null); setError(null); };

  const elegirImagen = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!r.canceled) {
      const a = r.assets[0];
      reset();
      setArchivo({ uri: a.uri, name: a.fileName || `imagen_${Date.now()}.jpg`, mimeType: a.mimeType || 'image/jpeg', size: a.fileSize });
    }
  };

  const elegirDocumento = async () => {
    const r = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!r.canceled) { reset(); setArchivo(r.assets[0]); }
  };

  const subir = async () => {
    if (!archivo) return;
    setSubiendo(true); setError(null); setProgreso(0);
    try { setResultado(await FileRepository.subir(archivo, setProgreso)); }
    catch { setError('Error al subir el archivo'); }
    finally { setSubiendo(false); }
  };
  return { archivo, progreso, subiendo, resultado, error, elegirImagen, elegirDocumento, subir };
}
