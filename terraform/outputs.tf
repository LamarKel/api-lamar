output "api_url" {
  description = "URL pública de la API (ponla en app-mobile/src/config/api.js)"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "lambda_name" {
  description = "Nombre de la función Lambda"
  value       = aws_lambda_function.api.function_name
}

output "ecr_repository_url" {
  description = "Repositorio de imágenes Docker"
  value       = aws_ecr_repository.api.repository_url
}

output "uploads_bucket" {
  description = "Bucket S3 de archivos subidos"
  value       = aws_s3_bucket.uploads.bucket
}

output "cloudwatch_log_group" {
  description = "Grupo de logs de la Lambda"
  value       = aws_cloudwatch_log_group.lambda.name
}

output "sns_topic_arn" {
  description = "ARN del tema SNS de notificaciones"
  value       = aws_sns_topic.notifications.arn
}

output "sqs_queue_url" {
  description = "URL de la cola SQS de notificaciones"
  value       = aws_sqs_queue.notifications.url
}

output "notification_lambda_name" {
  description = "Nombre de la Lambda de notificaciones"
  value       = aws_lambda_function.notification.function_name
}
output "dashboard_url" {
  description = "Dashboard de CloudWatch para las pruebas de carga"
  value       = "https://${var.aws_region}.console.aws.amazon.com/cloudwatch/home?region=${var.aws_region}#dashboards/dashboard/${aws_cloudwatch_dashboard.pruebas_carga.dashboard_name}"
}