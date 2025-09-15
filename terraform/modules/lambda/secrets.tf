resource "aws_secretsmanager_secret" "db_credentials" {
  name = "db_credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials_values" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.DB_USERNAME
    password = var.DB_PASSWORD
  })
}

resource "aws_secretsmanager_secret" "admin_secret" {
  name = "admin_secret"
}

resource "aws_secretsmanager_secret_version" "admin_secret_value" {
  secret_id     = aws_secretsmanager_secret.admin_secret.id
  secret_string = var.ADMIN_SECRET
}
