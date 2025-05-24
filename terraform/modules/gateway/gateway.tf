# largely created using https://spacelift.io/blog/terraform-api-gateway as reference
# please refer to this for any questions that aren't answered in comments in the code

resource "aws_api_gateway_rest_api" "scrapstack" {
  name        = "ScrapStack"
  description = ""

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

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
resource "aws_api_gateway_integration" "lambda_integration" {
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
    aws_api_gateway_integration.lambda_integration
  ]
}

resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.lambda_integration
  ]

  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
}

# 
# LOGGING STUFF
# 

resource "aws_api_gateway_method_settings" "gateway_log_settings" {
  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
  stage_name  = aws_api_gateway_stage.stage.stage_name
  method_path = "*/*"

  settings {
    metrics_enabled = true
    logging_level   = "INFO"
  }
}

# set log role arn so we have permission to log
resource "aws_api_gateway_account" "log_account" {
  cloudwatch_role_arn = var.cloudwatch_role_arn
}

resource "aws_api_gateway_stage" "stage" {
  stage_name    = var.stage_name
  rest_api_id   = aws_api_gateway_rest_api.scrapstack.id
  deployment_id = aws_api_gateway_deployment.deployment.id

  access_log_settings {
    destination_arn = var.gateway_log_group
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  depends_on = [aws_api_gateway_account.log_account]
}
