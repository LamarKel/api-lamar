variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Nombre base de los recursos"
  type        = string
  default     = "api-lamar"
}

variable "image_tag" {
  description = "Tag de la imagen Docker en ECR (el workflow manda el SHA del commit)"
  type        = string
  default     = "latest"
}

variable "lambda_memory" {
  description = "Memoria de la Lambda en MB (más memoria = más CPU = arranque más rápido)"
  type        = number
  default     = 2048
}

variable "lambda_timeout" {
  description = "Tiempo máximo de ejecución en segundos"
  type        = number
  default     = 30
}

variable "log_retention_days" {
  description = "Días que se guardan los logs en CloudWatch"
  type        = number
  default     = 7
}

# ---- Secretos: llegan desde GitHub Secrets como TF_VAR_* ----
variable "database_url" {
  description = "URL JDBC de la base de datos cloud (Neon)"
  type        = string
  sensitive   = true
}

variable "db_username" {
  description = "Usuario de la base de datos"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Contraseña de la base de datos"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Clave para firmar los JWT"
  type        = string
  sensitive   = true
}
