variable "hello_world_invoke_arn" {
  description = "The invoke arn for the hello world lambda"
  type        = string
}

variable "stage_name" {
  description = "The stage name for the API gateway"
  type        = string
}

variable "gateway_log_group" {
  description = "The arn of the log group the gateway should log to"
  type        = string
}

variable "cloudwatch_role_arn" {
  description = "The arn of the cloudwatch role that allows us to log"
  type        = string
}
