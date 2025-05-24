#
# Copy all of this for every function
#

resource "aws_lambda_function" "hello_world" {
  filename      = data.archive_file.hello_world_lambda_zip.output_path
  function_name = "hello_world"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "hello_world.hello_world"
  runtime       = var.python_runtime

  source_code_hash = data.archive_file.hello_world_lambda_zip.output_base64sha256
}

data "archive_file" "hello_world_lambda_zip" {
  type        = "zip"
  source_dir  = "../api/hello_world"
  output_path = "../api/dist/hello_world.zip"
}
