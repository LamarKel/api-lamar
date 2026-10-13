import { http } from './HttpClient';
export const NotificationService = {
  enviar: (req) => http.post('/notifications/send', req),
};
