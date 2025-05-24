# dictates the path for the request
# these resources will be available at <URL>/hello-world
resource "aws_api_gateway_resource" "hello_world" {
  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
  parent_id   = aws_api_gateway_rest_api.scrapstack.root_resource_id
  path_part   = "hello_world"
}

# each resource implemented with lambdas consists of method, integration, method response, and integration response
# here, "get" on hello-world is done as follows

resource "aws_api_gateway_method" "hello_world_proxy" {
  rest_api_id   = aws_api_gateway_rest_api.scrapstack.id
  resource_id   = aws_api_gateway_resource.hello_world.id
  http_method   = "GET"
  authorization = "NONE"
}

# IMPORTANT NOTE
# gateways always POST to lambdas, REGARDLESS of the actual gateway request method
resource "aws_api_gateway_integration" "hello_world_lambda_integration" {
  rest_api_id             = aws_api_gateway_rest_api.scrapstack.id
  resource_id             = aws_api_gateway_resource.hello_world.id
  http_method             = aws_api_gateway_method.hello_world_proxy.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = var.hello_world_invoke_arn
}

resource "aws_api_gateway_method_response" "hello_world_proxy" {
  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
  resource_id = aws_api_gateway_resource.hello_world.id
  http_method = aws_api_gateway_method.hello_world_proxy.http_method
  status_code = "200"

  # necessary because cors is whiny
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true,
    "method.response.header.Access-Control-Allow-Methods" = true,
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "hello_world_proxy" {
  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
  resource_id = aws_api_gateway_resource.hello_world.id
  http_method = aws_api_gateway_method.hello_world_proxy.http_method
  status_code = aws_api_gateway_method_response.hello_world_proxy.status_code

  # necessary because cors is whiny
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS,POST,PUT'",
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }

  depends_on = [
    aws_api_gateway_method.hello_world_proxy,
    aws_api_gateway_integration.hello_world_lambda_integration
  ]
}