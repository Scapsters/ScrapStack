output "documentdb_cluster_arn" {
    value = aws_docdbelastic_cluster.documentdb_cluster.arn
}

output "documentdb_cluster_endpoint" {
    value = aws_docdbelastic_cluster.documentdb_cluster.endpoint
}