import { View, Text, Image, TouchableOpacity, Linking } from 'react-native';
import { useUploadViewModel } from '../viewmodels/useUploadViewModel';
import { s, C } from './styles';

const kb = (b) => (b ? `${(b / 1024).toFixed(1)} KB` : '');

export default function UploadScreen() {
  const vm = useUploadViewModel();
  const esImagen = vm.archivo?.mimeType?.startsWith('image/');

  return (
    <View style={s.screen}>
      <TouchableOpacity style={s.btnOutline} onPress={vm.elegirImagen}><Text style={s.btnOutlineText}>Seleccionar imagen</Text></TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={vm.elegirDocumento}><Text style={s.btnOutlineText}> Seleccionar documento</Text></TouchableOpacity>

      {vm.archivo && (
        <View style={s.card}>
          {esImagen
            ? <Image source={{ uri: vm.archivo.uri }} style={{ width: '100%', height: 220, borderRadius: 8 }} resizeMode="cover" />
            : <Text style={{ fontSize: 48, textAlign: 'center' }}>📄</Text>}
          <Text style={{ fontWeight: '600', marginTop: 8 }}>{vm.archivo.name}</Text>
          <Text style={s.muted}>{vm.archivo.mimeType} · {kb(vm.archivo.size)}</Text>
        </View>
      )}

      {(vm.subiendo || vm.progreso > 0) && (
        <View style={{ marginBottom: 12 }}>
          <View style={{ height: 10, backgroundColor: '#e5e7eb', borderRadius: 5, overflow: 'hidden' }}>
            <View style={{ width: `${vm.progreso}%`, height: '100%', backgroundColor: C.primary }} />
          </View>
          <Text style={{ textAlign: 'center', marginTop: 4 }}>{vm.progreso}%</Text>
        </View>
      )}

      <TouchableOpacity style={[s.btn, !vm.archivo && { opacity: 0.5 }]} onPress={vm.subir} disabled={!vm.archivo || vm.subiendo}>
        <Text style={s.btnText}>{vm.subiendo ? 'Subiendo...' : 'Subir archivo'}</Text>
      </TouchableOpacity>

      {vm.error && <Text style={s.error}>{vm.error}</Text>}
      {vm.resultado && (
        <View style={s.card}>
          <Text style={{ fontWeight: '700', color: C.primary }}>Subido y guardado en BD (id {vm.resultado.id})</Text>
          <Text style={{ color: C.primary }} onPress={() => Linking.openURL(vm.resultado.url)}>{vm.resultado.url}</Text>
        </View>
      )}
    </View>
  );
}
