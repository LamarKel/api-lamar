import { StyleSheet } from 'react-native';
export const C = { primary: '#1d6f42', bg: '#f4f6f5', text: '#1b1b1b', muted: '#6b7280', danger: '#c0392b', card: '#fff' };
export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', color: C.text, marginBottom: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, marginBottom: 12 },
  btn: { backgroundColor: C.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnOutline: { borderWidth: 1, borderColor: C.primary, padding: 14, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#fff', fontWeight: '600' },
  btnOutlineText: { color: C.primary, fontWeight: '600' },
  error: { color: C.danger, marginBottom: 10 },
  card: { backgroundColor: C.card, padding: 14, borderRadius: 10, marginBottom: 10, elevation: 1 },
  muted: { color: C.muted },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
