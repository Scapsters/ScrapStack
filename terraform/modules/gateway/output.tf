output "api_gateway_execution_arn" {
    value = aws_api_gateway_rest_api.scrapstack.execution_arn
}

output "api_gateway_endpoint_url" {
    value = "https://${aws_api_gateway_rest_api.scrapstack.id}.execute-api.us-east-1.amazonaws.com/${aws_api_gateway_stage.stage.stage_name}/hello-world"
}