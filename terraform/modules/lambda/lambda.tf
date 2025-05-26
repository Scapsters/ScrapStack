data "aws_caller_identity" "current" {}

#
# Open adding_lambdas.excalidraw in in either https://excalidraw.com or by downloading the vscode extension for it
#

#
# When adding a function, create a new file or folder as appropriate. The only code to update here is THIS block. 
# Add your function to "depends_on" AND to "command"
#

resource "null_resource" "delete_lambda_source_zip" {

  depends_on = [
    aws_lambda_function.hello_world,
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
