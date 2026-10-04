import { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useUsuariosViewModel } from '../viewmodels/useUsuariosViewModel';
import { s, C } from './styles';

export default function UsuariosScreen({ navigation }) {
  const vm = useUsuariosViewModel();
  useFocusEffect(useCallback(() => { vm.cargar(); }, [vm.cargar]));

  const confirmarEliminar = (u) =>
    Alert.alert('Eliminar', `¿Eliminar a ${u.nombre}?`, [
      { text: 'Cancelar' },
      { text: 'Eliminar', style: 'destructive', onPress: () => vm.eliminar(u.id) },
    ]);

  return (
    <View style={s.screen}>
      <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('UsuarioForm')}><Text style={s.btnText}>+ Nuevo usuario</Text></TouchableOpacity>
      {vm.error && <Text style={s.error}>{vm.error}</Text>}
      <FlatList
        data={vm.usuarios}
        keyExtractor={(u) => String(u.id)}
        refreshing={vm.loading}
        onRefresh={vm.cargar}
        ListEmptyComponent={!vm.loading && <Text style={s.muted}>No hay usuarios</Text>}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '600' }}>{item.nombre}</Text>
                <Text style={s.muted}>{item.email}</Text>
                {item.telefono ? <Text style={s.muted}>📞 {item.telefono}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('UsuarioForm', { usuario: item })}><Text style={{ color: C.primary, marginRight: 14 }}>Editar</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => confirmarEliminar(item)}><Text style={{ color: C.danger }}>Eliminar</Text></TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}
