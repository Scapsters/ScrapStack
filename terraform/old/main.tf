module "cloudwatch" {
  source = "./modules/cloudwatch"
}

module "gateway" {
  source                  = "./modules/gateway"
  api_endpoint_invoke_arn = module.lambda.api_invoke_arn
  stage_name              = var.stage_name
  gateway_log_group       = module.cloudwatch.gateway_log_group_arn
  cloudwatch_role_arn     = module.cloudwatch.cloudwatch_role_arn
}