variable "node_runtime" {
  default = "nodejs22.x"
}

variable "DB_USERNAME" {
  type      = string
  sensitive = true
}

variable "DB_PASSWORD" {
  type      = string
  sensitive = true
}

variable "ADMIN_SECRET" {
  type      = string
  sensitive = true
}
