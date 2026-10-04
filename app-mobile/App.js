import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthRepository } from './src/repositories/AuthRepository';
import { setOnUnauthorized } from './src/services/HttpClient';
import LoginScreen from './src/views/LoginScreen';
import DashboardScreen from './src/views/DashboardScreen';
import UsuariosScreen from './src/views/UsuariosScreen';
import UsuarioFormScreen from './src/views/UsuarioFormScreen';
import UploadScreen from './src/views/UploadScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [logged, setLogged] = useState(null);

  useEffect(() => {
    AuthRepository.isLogged().then(setLogged);
    setOnUnauthorized(() => setLogged(false)); // token expirado → login
  }, []);

  const logout = async () => { await AuthRepository.logout(); setLogged(false); };

  if (logged === null) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!logged ? (
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {() => <LoginScreen onLogin={() => setLogged(true)} />}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Dashboard">{(p) => <DashboardScreen {...p} onLogout={logout} />}</Stack.Screen>
            <Stack.Screen name="Usuarios" component={UsuariosScreen} />
            <Stack.Screen name="UsuarioForm" component={UsuarioFormScreen} options={{ title: 'Usuario' }} />
            <Stack.Screen name="Upload" component={UploadScreen} options={{ title: 'Subir archivo' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
