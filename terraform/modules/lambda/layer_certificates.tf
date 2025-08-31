data "archive_file" "lambda_layer_certificates_zip" {
  type        = "zip"
  source_dir  = "./certificates/source"
  output_path = "./certificates/dist/certificates.zip"
}

resource "aws_lambda_layer_version" "lambda_layer_certificates" {
  filename   = data.archive_file.lambda_layer_certificates_zip.output_path
  layer_name = "lambda_layer_certificates"

  compatible_runtimes = [var.node_runtime]
  source_code_hash    = data.archive_file.lambda_layer_certificates_zip.output_base64sha256
}