variable "bucket_name" {
  description = "The name of the S3 bucket (remember: global unique!)"
  type        = string
}
variable "stage_name" {
  description = "The stage name to use for the API gateway"
  type        = string
}