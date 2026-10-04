import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLoginViewModel } from '../viewmodels/useLoginViewModel';
import { s } from './styles';

export default function LoginScreen({ onLogin }) {
  const vm = useLoginViewModel(onLogin);
  return (
    <View style={[s.screen, { justifyContent: 'center' }]}>
      <Text style={s.title}>{vm.modoRegistro ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
      {vm.modoRegistro && <TextInput style={s.input} placeholder="Nombre" value={vm.nombre} onChangeText={vm.setNombre} />}
      <TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={vm.email} onChangeText={vm.setEmail} />
      <TextInput style={s.input} placeholder="Contraseña" secureTextEntry value={vm.password} onChangeText={vm.setPassword} />
      {vm.error && <Text style={s.error}>{vm.error}</Text>}
      <TouchableOpacity style={s.btn} onPress={vm.submit} disabled={vm.loading}>
        {vm.loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{vm.modoRegistro ? 'Registrarme' : 'Entrar'}</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => vm.setModoRegistro(!vm.modoRegistro)}>
        <Text style={{ textAlign: 'center', color: '#1d6f42' }}>{vm.modoRegistro ? 'Ya tengo cuenta' : 'Crear una cuenta'}</Text>
      </TouchableOpacity>
    </View>
  );
}
