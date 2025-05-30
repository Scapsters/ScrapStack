output "client-url" {
  value       = aws_cloudfront_distribution.s3_distribution.domain_name
  description = "The domain name of the CloudFront distribution"
}
