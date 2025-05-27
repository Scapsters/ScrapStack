terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

module "s3-react" {
  source      = "./modules/s3-web"
  bucket_name = var.bucket_name
}

# commented out because cloudfront takes a very long time to create & destroy due to DNS registration on aws's side
# i recommend commenting this out for development whenever you need to touch the terraform configuration

# module "cloudfront" {
#     source = "./modules/cloudfront"
#     bucket_regional_domain_name = module.s3-react.bucket_domain_name
# }

module "cloudwatch" {
  source = "./modules/cloudwatch"
}

#
# Add here when adding new functions. Then, use it in gateway/gateway.tf
#

module "gateway" {
  source                 = "./modules/gateway"
  hello_world_invoke_arn = module.lambda.hello_world_invoke_arn

  # this is the invoke arn marker for the build tool
  stage_name             = var.stage_name
  gateway_log_group      = module.cloudwatch.gateway_log_group_arn
  cloudwatch_role_arn    = module.cloudwatch.cloudwatch_role_arn
}

module "lambda" {
  source                    = "./modules/lambda"
  api_gateway_execution_arn = module.gateway.api_gateway_execution_arn
}
