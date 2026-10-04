import { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useDashboardViewModel } from '../viewmodels/useDashboardViewModel';
import { s } from './styles';

export default function DashboardScreen({ navigation, onLogout }) {
  const vm = useDashboardViewModel();
  useEffect(() => { vm.cargar(); }, []);

  return (
    <ScrollView style={s.screen} refreshControl={<RefreshControl refreshing={vm.loading} onRefresh={vm.cargar} />}>
      {vm.loading && !vm.data && <ActivityIndicator size="large" />}
      {vm.error && <Text style={s.error}>{vm.error}</Text>}
      {vm.data && (
        <>
          <View style={s.card}>
            <Text style={{ fontWeight: '700' }}>Carga paralela (Promise.all)</Text>
            <Text>4 peticiones simultáneas en {vm.data.msParalelo} ms</Text>
            {vm.msSecuencial != null && <Text>Secuencial: {vm.msSecuencial} ms</Text>}
            <TouchableOpacity onPress={vm.compararSecuencial}><Text style={{ color: '#1d6f42', marginTop: 6 }}>Comparar con secuencial</Text></TouchableOpacity>
          </View>
          <View style={s.card}>
            <Text style={{ fontWeight: '700' }}>Perfil</Text>
            <Text>{vm.data.perfil.email}</Text>
          </View>
          <View style={s.card}>
            <Text style={{ fontWeight: '700' }}>Configuración</Text>
            <Text style={s.muted}>{vm.data.config.appName} v{vm.data.config.version} · máx {vm.data.config.maxUploadMB} MB</Text>
          </View>
          <View style={s.card}>
            <Text style={{ fontWeight: '700' }}>Resumen</Text>
            <Text>{vm.data.usuarios.length} usuarios · {vm.data.archivos.length} archivos subidos</Text>
          </View>
        </>
      )}
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Usuarios')}><Text style={s.btnText}>Gestionar usuarios</Text></TouchableOpacity>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Upload')}><Text style={s.btnText}>Subir archivo</Text></TouchableOpacity>
      <TouchableOpacity style={s.btnOutline} onPress={onLogout}><Text style={s.btnOutlineText}>Cerrar sesión</Text></TouchableOpacity>
    </ScrollView>
  );
}
