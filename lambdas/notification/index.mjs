// notification-lambda
// Recibe mensajes desde SQS (que vienen de SNS), los valida y envía el correo con Amazon SES.
// Todo lo que se imprime con console.log queda registrado en CloudWatch Logs.
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});
const SENDER = process.env.SENDER_EMAIL;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  console.log(`Lote recibido desde SQS: ${event.Records.length} mensaje(s)`);
  const batchItemFailures = [];

  for (const record of event.Records) {
    try {
      const { email, subject, message } = JSON.parse(record.body);

      if (!EMAIL_RE.test(email || "") || !subject || !message) {
        // Mensaje inválido: se descarta (no se reintenta)
        console.warn("Mensaje inválido, se descarta:", record.messageId);
        continue;
      }

      console.log(`Procesando mensaje ${record.messageId} -> ${email}`);

      const result = await ses.send(new SendEmailCommand({
        FromEmailAddress: SENDER,
        Destination: { ToAddresses: [email] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Text: { Data: message, Charset: "UTF-8" },
              Html: {
                Data: `<div style="font-family:Arial,sans-serif">
                         <h2>${escapeHtml(subject)}</h2>
                         <p>${escapeHtml(message)}</p>
                         <hr><small>Enviado desde App Lamar (AWS SNS + SQS + Lambda)</small>
                       </div>`,
                Charset: "UTF-8",
              },
            },
          },
        },
      }));

      console.log(`Correo enviado OK. MessageId SES: ${result.MessageId}`);
    } catch (err) {
      console.error(`Error procesando ${record.messageId}:`, err.message);
      batchItemFailures.push({ itemIdentifier: record.messageId }); // SQS lo reintentará
    }
  }

  return { batchItemFailures };
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
