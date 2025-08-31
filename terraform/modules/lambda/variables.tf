variable "api_gateway_execution_arn" {
  description = "The execution arn of the API Gateway"
  type        = string
}

variable "node_runtime" {
  description = "The runtime of node"
  type        = string
  default     = "nodejs22.x"
}

variable "db_endpoint" {
  type = string
}