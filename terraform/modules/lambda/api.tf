resource "aws_lambda_function" "api" {
  filename      = data.archive_file.api_lambda_zip.output_path
  function_name = "api"
  role          = aws_iam_role.lambda_policy.arn
  handler       = "lambda.handle_request"
  runtime       = var.node_runtime
  timeout       = 45

  source_code_hash = data.archive_file.api_lambda_zip.output_base64sha256

  environment {
    variables = {
      DB_CREDENTIALS = aws_secretsmanager_secret.db_credentials.id
      ADMIN_ANSWER   = aws_secretsmanager_secret.admin_secret.id
      ENVIRONMENT    = "lambda"
    }
  }
}

data "archive_file" "api_lambda_zip" {
  type        = "zip"
  source_dir  = "../api/out"
  output_path = "../api/dist/out.zip"
}

resource "aws_lambda_function_url" "api_url" {
  function_name      = aws_lambda_function.api.function_name
  authorization_type = "NONE"

  cors {
    allow_credentials = true
    allow_origins = [
      "http://localhost:5173",
      "https://scrapstack.net",
      "https://www.scrapstack.net",
      "https://furryslop.com",
      "https://www.furryslop.com"
    ]
    allow_methods = ["*"]
    allow_headers = [
      "content-type",         # Allows Content-Type header
      "authorization",        # For auth tokens
      "x-api-key",            # For API keys
      "x-amz-date",           # AWS signature headers
      "x-amz-security-token", # AWS signature headers
      "x-requested-with",     # Common AJAX header
      "accept",               # Accept header
      "origin",                # Origin header
      "usertoken",
      "usertoken2",
    ]
  }
}

# Resource-based policy for public access
resource "aws_lambda_permission" "allow_public_access" {
  statement_id           = "FunctionURLAllowPublicAccess"
  action                 = "lambda:InvokeFunctionUrl"
  function_name          = aws_lambda_function.api.function_name
  principal              = "*"
  function_url_auth_type = "NONE"
}
