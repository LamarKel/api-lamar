import * as SecureStore from 'expo-secure-store';
const KEY = 'jwt_token';
export const TokenStorage = {
  save: (t) => SecureStore.setItemAsync(KEY, t),
  get: () => SecureStore.getItemAsync(KEY),
  clear: () => SecureStore.deleteItemAsync(KEY),
};
