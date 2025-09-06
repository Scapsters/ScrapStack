output "api_invoke_arn" {
  value = aws_lambda_function.api.invoke_arn
}

output "lambda_url" {
  value = aws_lambda_function_url.api_url
}
