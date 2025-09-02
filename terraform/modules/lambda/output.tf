output "api_invoke_arn" {
  value = aws_lambda_function.api.invoke_arn
}

output "lambda_role_arn" {
  value = aws_iam_role.lambda_policy.arn
}
