variable "bucket_regional_domain_name" {
    description = "The regional domain name of the bucket"
    type        = string
}

variable "s3-origin-id" {
    description = "The ID of the S3 origin (not required to be unique)"
    type        = string
    default     = "ScrapStackDefaultOrigin"
}