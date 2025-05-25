variable "api_gateway_execution_arn" {
  description = "The execution arn of the API Gateway"
  type        = string
}

variable "python_runtime" {
  description = "The runtime of python"
  type        = string
  default     = "python3.9"
}
