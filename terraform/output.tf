output "client-url" {
  description = "The domain name of the CloudFront distribution"
  value       = module.s3-react
}

output "api_gateway_endpoint_url" {
  value = module.gateway.api_gateway_endpoint_url
}

output "lambda_role_arn" {
  description = "MongoDB wants this to allow the lambda to be authorized to connect"
  value = module.lambda.lambda_role_arn
}