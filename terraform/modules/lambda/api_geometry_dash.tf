#
# Copy all of this for every function
#

# Define the function and where the zip is (will be)
resource "aws_lambda_function" "geometry_dash" {
  layers = [aws_lambda_layer_version.lambda_layer_dependencies.arn, aws_lambda_layer_version.lambda_layer_model.arn]

  filename      = data.archive_file.geometry_dash_lambda_zip.output_path
  function_name = "geometry_dash"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "geometry_dash.geometry_dash"
  runtime       = var.python_runtime

  source_code_hash = data.archive_file.geometry_dash_lambda_zip.output_base64sha256
}

# Define the zip and where the code is. output_path is what does in lambda.ts so terraform can delete it afterwards
data "archive_file" "geometry_dash_lambda_zip" {
  type        = "zip"
  source_dir  = "../api/api/geometry_dash"
  output_path = "../api/dist/geometry_dash.zip"
}

# Output the URL (:
output "geometry_dash_invoke_arn" {
  value = aws_lambda_function.geometry_dash.invoke_arn
}

# give gateway invokers the lambda invoke policy
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.geometry_dash.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}