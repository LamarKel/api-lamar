import { NotificationService } from '../services/NotificationService';
import { NotificationRequest } from '../models/Notification';

export const NotificationRepository = {
  async enviar(email, subject, message) {
    const { data } = await NotificationService.enviar(NotificationRequest(email, subject, message));
    return data; // { status, messageId, mensaje }
  },
};
