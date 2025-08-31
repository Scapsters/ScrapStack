output "api_endpoint" {
  description = "API endpoint"
  value       = module.gateway.api_gateway_hello_world_endpoint_url
}

output "documentdb_cluster_endpoint" {
  description = "DocumentDB cluster endpoint"
  value = module.database.documentdb_cluster_endpoint
}
