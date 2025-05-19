output "bucket_domain_name" {
    value = aws_s3_bucket.static_website.bucket_regional_domain_name
    description = "The regional domain name of the bucket"
    sensitive = true # make terraform not show this, cuz it's not useful to client
}