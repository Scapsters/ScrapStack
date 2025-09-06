# # give gateway invokers the lambda invoke policy
# resource "aws_lambda_permission" "apigw_lambda" {
#   statement_id  = "AllowExecutionFromAPIGateway"
#   action        = "lambda:InvokeFunction"
#   function_name = aws_lambda_function.api.function_name
#   principal     = "apigateway.amazonaws.com"
#   source_arn    = "${var.api_gateway_execution_arn}/*/*"
# }