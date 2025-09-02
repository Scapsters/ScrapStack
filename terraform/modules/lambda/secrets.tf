resource "aws_secretsmanager_secret" "db_credentials" {
    name = "db_credentials"
}

resource "aws_secretsmanager_secret_version" "db_credentials_values" {
    secret_id = aws_secretsmanager_secret.db_credentials.id
    secret_string = jsonencode({
        username = var.db_username
        password = var.db_password
    })
}