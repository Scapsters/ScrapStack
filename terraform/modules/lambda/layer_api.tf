#
# Anything in the api that isnt an endpoint is on its on layer to be shared by all endpoints
#

# zip dependencies
data "archive_file" "lambda_layer_model_zip" {
  type        = "zip"
  source_dir  = "../api/model"
  output_path = "../api/dist/model.zip"
}

resource "aws_lambda_layer_version" "lambda_layer_model" {
  filename   = data.archive_file.lambda_layer_model_zip.output_path
  layer_name = "lambda_layer_model"

  compatible_runtimes = [var.python_runtime]
  source_code_hash    = data.archive_file.lambda_layer_model_zip.output_base64sha256
}
