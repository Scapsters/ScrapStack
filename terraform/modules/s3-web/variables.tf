variable "bucket_name" {
  description = "The name of the S3 bucket (remember: global unique!)"
  type        = string
}

variable "website_index_document" {
  description = "The index document for the website"
  type        = string
  default     = "index.html"
}

variable "website_error_document" {
  description = "The error document for the website"
  type        = string
  default     = "error.html"
}

variable "website_files_path" {
  description = "The local path to the website files"
  type        = string
  default = "../client/build"
}