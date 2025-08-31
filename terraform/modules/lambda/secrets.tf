resource "aws_secretsmanager_secret" "db_secret" {
    name = "db/scrapstack/credentials"
    description = "DB credentials"
}

resource "aws_secretsmanager_secret_version" "db_secret_value" {
    secret_id = aws_secretsmanager_secret.db_secret.id
    secret_string = jsonencode({
        username = var.db_username
        password = var.db_password
    })
}

variable "db_username" {
    type = string
    sensitive = true
}

variable "db_password" {
    type = string
    sensitive = true
}