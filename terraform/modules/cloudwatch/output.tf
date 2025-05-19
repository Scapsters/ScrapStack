output "gateway_log_group_arn" {
    value = aws_cloudwatch_log_group.gateway_log_group.arn
}

output "cloudwatch_role_arn" {
    value = aws_iam_role.apigateway_cloudwatch.arn
}