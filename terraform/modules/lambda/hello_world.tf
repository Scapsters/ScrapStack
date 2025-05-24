#
# Copy all of this for every function
#

# Define the function and where the zip is (will be)
resource "aws_lambda_function" "hello_world" {
  layers = [aws_lambda_layer_version.lambda_layer_dependencies.arn]

  filename      = data.archive_file.hello_world_lambda_zip.output_path
  function_name = "hello_world"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "hello_world.hello_world"
  runtime       = var.python_runtime

  source_code_hash = data.archive_file.hello_world_lambda_zip.output_base64sha256
}

# Define the zip and where the code is. output_path is what does in lambda.ts so terraform can delete it afterwards
data "archive_file" "hello_world_lambda_zip" {
  type        = "zip"
  source_dir  = "../api/hello_world"
  output_path = "../api/dist/hello_world.zip"
}

# Output the URL (:
output "hello_world_invoke_arn" {
  value = aws_lambda_function.hello_world.invoke_arn
}

# give gateway invokers the lambda invoke policy
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello_world.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}