import { useState } from 'react';
import { NotificationRepository } from '../repositories/NotificationRepository';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function useNotificationViewModel() {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Prueba SNS');
  const [message, setMessage] = useState('Hola desde AWS Serverless');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok, texto, messageId }

  const enviar = async () => {
    if (!EMAIL_RE.test(email)) return setResultado({ ok: false, texto: 'Ingresa un correo válido' });
    if (!subject.trim() || !message.trim()) return setResultado({ ok: false, texto: 'Asunto y mensaje son obligatorios' });

    setLoading(true); setResultado(null);
    try {
      const data = await NotificationRepository.enviar(email.trim(), subject, message);
      setResultado({ ok: true, texto: 'Mensaje enviado correctamente.', messageId: data.messageId });
    } catch {
      setResultado({ ok: false, texto: 'Error al enviar mensaje.' });
    } finally { setLoading(false); }
  };

  return { email, setEmail, subject, setSubject, message, setMessage, loading, resultado, enviar };
}
