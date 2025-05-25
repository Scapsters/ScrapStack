#
# Allows all lambdas to access dependencies without needing to zip it up every time
#

# zip dependencies
data "archive_file" "lambda_layer_dependencies_zip" {
  type        = "zip"
  source_dir  = "../api/source"
  output_path = "../api/dist/source.zip"
}

# allow all lambdas to use the same set of dependencies. This might break concurrent database accessing if AWS is stupid enough. It shouldn't. Just saves upload space and dependency management
resource "aws_lambda_layer_version" "lambda_layer_dependencies" {
  filename   = data.archive_file.lambda_layer_dependencies_zip.output_path
  layer_name = "lambda_layer_dependencies"

  compatible_runtimes = [var.python_runtime]
  source_code_hash    = data.archive_file.lambda_layer_dependencies_zip.output_base64sha256
}
