resource "aws_lambda_function" "api" {
  layers = [
    aws_lambda_layer_version.lambda_layer_certificates.arn,
  ]

  filename      = data.archive_file.api_lambda_zip.output_path
  function_name = "api"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "api.handle_request"
  runtime       = var.node_runtime
  timeout = 45

  source_code_hash = data.archive_file.api_lambda_zip.output_base64sha256

  environment {
    variables = {
      DB_CREDENTIALS_SECRET_ARN = aws_secretsmanager_secret_version.db_secret_value.arn
      DB_ENDPOINT = var.db_endpoint
      DB_USERNAME = "scapsters"
      DB_PASSWORD = "Bluedog1234"
    }
  }
}

data "archive_file" "api_lambda_zip" {
  type        = "zip"
  source_dir  = "../api/out"
  output_path = "../api/dist/out.zip"
}

# give gateway invokers the lambda invoke policy
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}