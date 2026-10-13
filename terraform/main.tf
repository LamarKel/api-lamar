data "aws_caller_identity" "current" {}

locals {
  name        = var.project_name
  bucket_name = "${var.project_name}-uploads-${data.aws_caller_identity.current.account_id}"
}

# ======================================================================
# 1. ECR - Repositorio de imágenes Docker de la API
# ======================================================================
resource "aws_ecr_repository" "api" {
  name                 = local.name
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Solo conserva las últimas 5 imágenes (ahorra espacio/costo)
resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Conservar solo 5 imagenes"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 5
      }
      action = { type = "expire" }
    }]
  })
}

# ======================================================================
# 2. S3 - Archivos subidos (el disco de Lambda es temporal)
# ======================================================================
resource "aws_s3_bucket" "uploads" {
  bucket        = local.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "uploads" {
  bucket                  = aws_s3_bucket.uploads.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

# Lectura pública de los archivos para que la app pueda mostrarlos por URL
resource "aws_s3_bucket_policy" "uploads_public_read" {
  bucket     = aws_s3_bucket.uploads.id
  depends_on = [aws_s3_bucket_public_access_block.uploads]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

# ======================================================================
# 3. IAM - Rol que asume la Lambda
# ======================================================================
resource "aws_iam_role" "lambda" {
  name = "${local.name}-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

# Permiso para escribir logs en CloudWatch
resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Permiso para subir/leer archivos SOLO en su bucket (mínimo privilegio)
resource "aws_iam_role_policy" "lambda_s3" {
  name = "${local.name}-s3-access"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
      Resource = "${aws_s3_bucket.uploads.arn}/*"
    }]
  })
}

# Permiso para publicar en el tema SNS de notificaciones
resource "aws_iam_role_policy" "lambda_sns_publish" {
  name = "${local.name}-sns-publish"
  role = aws_iam_role.lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "sns:Publish"
      Resource = aws_sns_topic.notifications.arn
    }]
  })
}

# ======================================================================
# 4. CloudWatch Logs
# ======================================================================
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name}"
  retention_in_days = var.log_retention_days
}

resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${local.name}"
  retention_in_days = var.log_retention_days
}

# ======================================================================
# 5. Lambda - La API Spring Boot empaquetada como imagen Docker
# ======================================================================
resource "aws_lambda_function" "api" {
  function_name = local.name
  role          = aws_iam_role.lambda.arn
  package_type  = "Image"
  image_uri     = "${aws_ecr_repository.api.repository_url}:${var.image_tag}"
  memory_size   = var.lambda_memory
  timeout       = var.lambda_timeout
  architectures = ["x86_64"]

  environment {
    variables = {
      SPRING_DATASOURCE_URL      = var.database_url
      SPRING_DATASOURCE_USERNAME = var.db_username
      SPRING_DATASOURCE_PASSWORD = var.db_password
      JWT_SECRET                 = var.jwt_secret
      S3_BUCKET                  = aws_s3_bucket.uploads.bucket
      SNS_TOPIC_ARN              = aws_sns_topic.notifications.arn
      UPLOAD_DIR                 = "/tmp/uploads" # único directorio escribible en Lambda
      AWS_LWA_PORT               = "8080"
      JAVA_TOOL_OPTIONS          = "-XX:+TieredCompilation -XX:TieredStopAtLevel=1"
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.lambda,
    aws_iam_role_policy_attachment.lambda_logs,
  ]
}

# ======================================================================
# 6. API Gateway (HTTP API) - Puerta de entrada pública
# ======================================================================
resource "aws_apigatewayv2_api" "api" {
  name          = "${local.name}-gateway"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Authorization", "Content-Type"]
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.api.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Ruta comodín: todas las rutas y métodos van a la Lambda (Spring decide)
resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId = "$context.requestId"
      ip        = "$context.identity.sourceIp"
      method    = "$context.httpMethod"
      path      = "$context.path"
      status    = "$context.status"
      latency   = "$context.integrationLatency"
    })
  }

  default_route_settings {
    throttling_burst_limit = 50
    throttling_rate_limit  = 100
  }
}

# Permiso para que API Gateway invoque la Lambda
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.api.execution_arn}/*/*"
}

# ######################################################################
#  MENSAJERÍA DESACOPLADA: SNS -> SQS -> notification-lambda -> Correo
# ######################################################################

# ======================================================================
# 7. SNS Topic - el backend publica aquí
# ======================================================================
resource "aws_sns_topic" "notifications" {
  name = "${local.name}-notifications"
}

# ======================================================================
# 8. SQS Queue (+ cola de mensajes fallidos)
# ======================================================================
resource "aws_sqs_queue" "notifications_dlq" {
  name                      = "${local.name}-notifications-dlq"
  message_retention_seconds = 1209600 # 14 días
}

resource "aws_sqs_queue" "notifications" {
  name                       = "${local.name}-notifications-queue"
  visibility_timeout_seconds = 60 # debe ser mayor que el timeout de la Lambda
  message_retention_seconds  = 345600

  # Si un mensaje falla 3 veces, se mueve a la DLQ
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notifications_dlq.arn
    maxReceiveCount     = 3
  })
}

# Permite que SOLO este tema SNS escriba en la cola
resource "aws_sqs_queue_policy" "notifications" {
  queue_url = aws_sqs_queue.notifications.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowSNSPublish"
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.notifications.arn
      Condition = {
        ArnEquals = { "aws:SourceArn" = aws_sns_topic.notifications.arn }
      }
    }]
  })
}

# ======================================================================
# 9. Suscripción SNS -> SQS
# ======================================================================
resource "aws_sns_topic_subscription" "notifications_to_sqs" {
  topic_arn            = aws_sns_topic.notifications.arn
  protocol             = "sqs"
  endpoint             = aws_sqs_queue.notifications.arn
  raw_message_delivery = true # la cola recibe el JSON tal cual, sin envoltorio de SNS
  depends_on           = [aws_sqs_queue_policy.notifications]
}

# ======================================================================
# 10. Amazon SES - identidades de correo verificadas
#     (AWS envía un correo de verificación a cada dirección)
# ======================================================================
resource "aws_ses_email_identity" "sender" {
  email = var.notification_sender_email
}

resource "aws_ses_email_identity" "recipients" {
  for_each = toset(var.notification_test_recipients)
  email    = each.value
}

# ======================================================================
# 11. IAM Role de notification-lambda
# ======================================================================
resource "aws_iam_role" "notification_lambda" {
  name = "notification-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "notification_logs" {
  role       = aws_iam_role.notification_lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "notification_permissions" {
  name = "notification-lambda-permissions"
  role = aws_iam_role.notification_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "LeerSQS"
        Effect   = "Allow"
        Action   = ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:GetQueueAttributes"]
        Resource = aws_sqs_queue.notifications.arn
      },
      {
        Sid      = "EnviarCorreoSES"
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      }
    ]
  })
}

# ======================================================================
# 12. CloudWatch Logs de notification-lambda
# ======================================================================
resource "aws_cloudwatch_log_group" "notification_lambda" {
  name              = "/aws/lambda/notification-lambda"
  retention_in_days = var.log_retention_days
}

# ======================================================================
# 13. notification-lambda (Node.js) - empaquetada en .zip por Terraform
# ======================================================================
data "archive_file" "notification_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../lambdas/notification"
  output_path = "${path.module}/notification-lambda.zip"
}

resource "aws_lambda_function" "notification" {
  function_name    = "notification-lambda"
  role             = aws_iam_role.notification_lambda.arn
  runtime          = "nodejs20.x"
  handler          = "index.handler"
  filename         = data.archive_file.notification_lambda.output_path
  source_code_hash = data.archive_file.notification_lambda.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      SENDER_EMAIL = var.notification_sender_email
    }
  }

  depends_on = [
    aws_cloudwatch_log_group.notification_lambda,
    aws_iam_role_policy_attachment.notification_logs,
  ]
}

# ======================================================================
# 14. Event Source Mapping SQS -> notification-lambda
# ======================================================================
resource "aws_lambda_event_source_mapping" "sqs_to_notification" {
  event_source_arn        = aws_sqs_queue.notifications.arn
  function_name           = aws_lambda_function.notification.arn
  batch_size              = 5
  function_response_types = ["ReportBatchItemFailures"] # reintenta solo los mensajes que fallen
  depends_on              = [aws_iam_role_policy.notification_permissions]
}
