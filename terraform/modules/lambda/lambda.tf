data "aws_caller_identity" "current" {}

resource "aws_iam_role" "lambda_policy" {
  name = "lambda_db_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole",
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_policy_attachment" "lambda_exec_policy" {
  name       = "lambda_exec_policy_attachment"
  roles      = [aws_iam_role.lambda_policy.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_policy_attachment" "lambda_secrets_policy" {
  name       = "lambda_secrets_policy_attachment"
  roles      = [aws_iam_role.lambda_policy.name]
  policy_arn = "arn:aws:iam::aws:policy/SecretsManagerReadWrite"
}
