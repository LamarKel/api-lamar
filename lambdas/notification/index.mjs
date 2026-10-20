// notification-lambda
// Recibe mensajes desde SQS (que vienen de SNS), los valida y envía el correo con Amazon SES.
// Todo lo que se imprime con console.log queda registrado en CloudWatch Logs.
//
// MODO SIMULACIÓN (pruebas de carga): si el correo pertenece a un dominio de
// SIMULATE_DOMAINS (ej. test.com), el mensaje se procesa completo pero NO se envía
// por SES. Así las pruebas de carga miden SNS -> SQS -> Lambda sin chocar con el
// límite de SES en modo sandbox (1 correo/segundo, 200 por día, solo correos verificados).
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({});
const SENDER = process.env.SENDER_EMAIL;
const SIMULATE = (process.env.SIMULATE_DOMAINS || "").split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const handler = async (event) => {
  const inicio = Date.now();
  console.log(`Lote recibido desde SQS: ${event.Records.length} mensaje(s)`);
  const batchItemFailures = [];
  let simulados = 0, enviados = 0;

  for (const record of event.Records) {
    try {
      const { email, subject, message } = JSON.parse(record.body);

      if (!EMAIL_RE.test(email || "") || !subject || !message) {
        console.warn("Mensaje inválido, se descarta:", record.messageId);
        continue;
      }

      // Tiempo que el mensaje pasó en la cola (desde que SQS lo recibió)
      const espera = Date.now() - Number(record.attributes?.SentTimestamp || Date.now());

      const dominio = email.split("@")[1].toLowerCase();
      if (SIMULATE.includes(dominio)) {
        simulados++;
        console.log(`SIMULADO (prueba de carga) ${record.messageId} -> ${email} | espera en cola: ${espera} ms`);
        continue;
      }

      console.log(`Procesando mensaje ${record.messageId} -> ${email} | espera en cola: ${espera} ms`);
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
      enviados++;
      console.log(`Correo enviado OK. MessageId SES: ${result.MessageId}`);
    } catch (err) {
      console.error(`ERROR procesando ${record.messageId}:`, err.message);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }

  console.log(`Lote terminado en ${Date.now() - inicio} ms | enviados=${enviados} simulados=${simulados} fallidos=${batchItemFailures.length}`);
  return { batchItemFailures };
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
