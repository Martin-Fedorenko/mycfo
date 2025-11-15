variable "aws_region" {
  description = "Región de AWS"
  type        = string
  default     = "sa-east-1"
}

variable "instance_type" {
  description = "Tipo de instancia EC2"
  type        = string
  default     = "t3.micro"
}

variable "mycfo1_test_secret" {
  description = "Valor del secreto de prueba para MyCFO1"
  type        = string
  default     = "MiSecretoDePrueba123"
  sensitive   = true
}

variable "app_test_env_var" {
  description = "Valor de la variable de entorno de prueba para MyCFO1"
  type        = string
  default     = "MiVariableDeEntorno456"
}

variable "lambda_forecast_url" {
  description = "URL de la Lambda de forecast"
  type        = string
  default     = "https://bhhjxxuar5.execute-api.sa-east-1.amazonaws.com/PROD/forecast"
}

