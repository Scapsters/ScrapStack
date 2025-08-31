data "aws_caller_identity" "current" {}

# Delete lambda source zips on every run
resource "null_resource" "delete_lambda_source_zip" {

  depends_on = [
    aws_lambda_function.api
  ]

  provisioner "local-exec" {
    command     = <<EOT
#!/bin/bash
rm ../api/dist/out.zip
rm ./certificates/dist/certificates.zip
    EOT
    interpreter = ["bash", "-c"]
  }

  triggers = {
    always_run = timestamp()
  }
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_db_role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Lambda invoke policy
resource "aws_iam_policy_attachment" "lambda_policy" {
  name       = "lambda_policy"
  roles      = [aws_iam_role.lambda_exec.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy_attachment" "secrets_policy_attachment" {
  name = "db_secrets_policy"
  roles = [aws_iam_role.lambda_exec.name]
  policy_arn = aws_iam_policy.secrets_policy.arn
}

resource "aws_iam_policy" "secrets_policy" {
  name   = "lambda_db_secrets_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"],
        Resource = aws_secretsmanager_secret.db_secret.arn
      },
      {
        Effect   = "Allow"
        Action   = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Resource = "*"
      }
    ]
  })
}
