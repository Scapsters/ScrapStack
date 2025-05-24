data "aws_caller_identity" "current" {}

#
# Module structure:
# /lambda (this directory): stores absolutely general information that is general to all lambdas
# /dependencies: stores the dependencies layer
# /model: stores the model layer
# /api: stores resources general to all resources/endpoints and also for specific functions
#


#
# When adding a function, create a new file or folder as appropriate. The only code to update here is THIS block. 
# Add your function to "depends_on" AND to "command"
#

resource "null_resource" "delete_lambda_source_zip" {

  depends_on = [
    aws_lambda_function.hello_world
  ]

  provisioner "local-exec" {
    command     = <<EOT
#!/bin/bash
rm ../api/dist/source.zip
rm ../api/dist/hello_world.zip
    EOT
    interpreter = ["bash", "-c"]
  } # Will rm ../api/dist work or do i haev to rm every file

  triggers = {
    always_run = timestamp()
  }
}

#
# OTHER GLOBALS
#
# used for every function you will make ever
# probably don't have to remake or edit these
#

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
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.hello_world.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${var.api_gateway_execution_arn}/*/*"
}

module "api" {
  source = "api"
  python_runtime = var.python_runtime
}
