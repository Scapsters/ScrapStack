output "cloudfront-url" {
  description = "The domain name of the CloudFront distribution"
  value       = module.s3-react.bucket_domain_name
  sensitive   = true
}

output "lambda_url" {
  value = module.lambda.lambda_url
}
