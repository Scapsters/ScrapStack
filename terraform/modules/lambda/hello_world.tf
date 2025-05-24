#
# Copy all of this for every function
#

resource "aws_lambda_function" "hello_world" {
  filename      = data.archive_file.lambda_zip.output_path
  function_name = "hello_world"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "hello_world.hello_world"
  runtime       = "python3.9"

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../api/source"
  output_path = "../api/lambda.zip"
}

resource "null_resource" "delete_lambda_source_zip" {
    provisioner "local-exec" {
    command = <<EOT
#!/bin/bash
rm ../api/lambda.zip
    EOT
    interpreter = [ "bash", "-c" ]
  }

  triggers = {
    always_run = timestamp()
  }

  depends_on = [ aws_lambda_function.hello_world ]
}
