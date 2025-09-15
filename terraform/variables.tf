variable "BUCKET_NAME" {
  description = "The name of the S3 bucket (remember: global unique!)"
  type        = string
}

variable "STAGE_NAME" {
  description = "The stage name to use for the API gateway"
  type        = string
}

variable "DB_USERNAME" {
  type = string
  sensitive = true  
}

variable "DB_PASSWORD" {
  type = string
  sensitive = true  
}

variable "ADMIN_SECRET" {
  description = "SHA256 hash of admin password"
  type = string
  sensitive = true
}

variable "CLOUDFLARE_API_TOKEN" {
  type = string
}

variable "API_DOCUMENTATION_SITE_PATH" {
  description = "path to api documentation dist"
  type = string
}

variable "CLOUDFLARE_ACCOUNT_ID" {
  type = string
}

variable "R2_ACCESS_KEY" {
  type = string
}

variable "R2_SECRET_KEY" {
  type = string
}