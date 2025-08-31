resource "aws_docdbelastic_cluster" "db_cluster" {
  name                = "my-docdb-cluster"
  admin_user_name     = var.username
  admin_user_password = var.password
  auth_type           = "PLAIN_TEXT"
  shard_capacity      = 2
  shard_count         = 1
}