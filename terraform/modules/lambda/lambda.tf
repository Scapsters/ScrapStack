data "aws_caller_identity" "current" {}

# 
# ADDING NEW FUNCTIONS IS DONE HERE
# 
# you shouldn't have to recreate the roles
# instead, you can reuse the role and policy and simply make new resources of aws_lambda_function that call new versions of 
resource "aws_lambda_function" "hello_world" {
  filename      = data.archive_file.lambda_zip.output_path
  function_name = "hello_world"
  role          = aws_iam_role.lambda_exec.arn
  handler       = "hello_world.hello_world"
  runtime       = "python3.9"

  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
}

#
# GLOBALS
#
# used for every function you will make ever
# probably don't have to remake these

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "../api/source"
  output_path = "../api/lambda.zip"
}

# create a role that can execute lambda
# our function calls the lambda through this role
resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# policy that allows lambda invoke
resource "aws_iam_policy_attachment" "lambda_policy" {
  name       = "lambda_policy"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# give gateway invokers the lambda invoke policy
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id = "AllowExecutionFromAPIGateway"
  action = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello_world.function_name
  principal = "apigateway.amazonaws.com"
  source_arn = "${var.api_gateway_execution_arn}/*/*"
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