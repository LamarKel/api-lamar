import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useNotificationViewModel } from '../viewmodels/useNotificationViewModel';
import { s, C } from './styles';

export default function NotificationScreen() {
  const vm = useNotificationViewModel();
  return (
    <ScrollView style={s.screen} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>Enviar correo</Text>
      <Text style={[s.muted, { marginBottom: 12 }]}>App → API Gateway → Lambda → SNS → SQS → notification-lambda → Correo</Text>

      <TextInput style={s.input} placeholder="Correo destino" autoCapitalize="none" keyboardType="email-address"
        value={vm.email} onChangeText={vm.setEmail} />
      <TextInput style={s.input} placeholder="Asunto" value={vm.subject} onChangeText={vm.setSubject} />
      <TextInput style={[s.input, { height: 120, textAlignVertical: 'top' }]} placeholder="Mensaje" multiline
        value={vm.message} onChangeText={vm.setMessage} />

      <TouchableOpacity style={s.btn} onPress={vm.enviar} disabled={vm.loading}>
        {vm.loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Enviar</Text>}
      </TouchableOpacity>

      {vm.resultado && (
        <View style={[s.card, { borderLeftWidth: 4, borderLeftColor: vm.resultado.ok ? C.primary : C.danger }]}>
          <Text style={{ fontWeight: '700', color: vm.resultado.ok ? C.primary : C.danger }}>{vm.resultado.texto}</Text>
          {vm.resultado.messageId && <Text style={s.muted}>SNS MessageId: {vm.resultado.messageId}</Text>}
        </View>
      )}
    </ScrollView>
  );
}
