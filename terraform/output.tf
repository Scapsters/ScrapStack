output "hello_world_gateway_endpoint" {
    description = "GET request to this to call the hello world endpoint"
    value = module.gateway.api_gateway_endpoint_url
}