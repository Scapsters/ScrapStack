#
# These should be gateway globals. Only small changes needed here. To make a new endpoint you want hello_world.tf
#

# largely created using https://spacelift.io/blog/terraform-api-gateway as reference
# please refer to this for any questions that aren't answered in comments in the code

#
# Add to depends on when adding new functions
#

resource "aws_api_gateway_deployment" "deployment" {
  depends_on = [
    aws_api_gateway_integration.hello_world_lambda_integration,

    # this is the depends_on marker for the build tool
  ]

  rest_api_id = aws_api_gateway_rest_api.scrapstack.id
}

resource "aws_api_gateway_rest_api" "scrapstack" {
  name        = "ScrapStack"
  description = ""

  endpoint_configuration {
    types = ["REGIONAL"]
  }
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
