import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useUsuarioFormViewModel } from '../viewmodels/useUsuarioFormViewModel';
import { s } from './styles';

export default function UsuarioFormScreen({ route, navigation }) {
  const vm = useUsuarioFormViewModel(route.params?.usuario, () => navigation.goBack());
  return (
    <View style={s.screen}>
      <Text style={s.title}>{vm.editando ? 'Editar usuario' : 'Nuevo usuario'}</Text>
      <TextInput style={s.input} placeholder="Nombre" value={vm.nombre} onChangeText={vm.setNombre} />
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={vm.email} onChangeText={vm.setEmail} />
      <TextInput style={s.input} placeholder="Teléfono" keyboardType="phone-pad" value={vm.telefono} onChangeText={vm.setTelefono} />
      <TextInput style={s.input} placeholder="Contraseña" secureTextEntry value={vm.password} onChangeText={vm.setPassword} />
      {vm.error && <Text style={s.error}>{vm.error}</Text>}
      <TouchableOpacity style={s.btn} onPress={vm.guardar} disabled={vm.loading}>
        {vm.loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Guardar</Text>}
      </TouchableOpacity>
    </View>
  );
}
