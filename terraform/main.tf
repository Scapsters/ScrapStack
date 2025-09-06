terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
  }
  backend "s3" {
    bucket  = "scapsters-scrapstack-terraform-state"
    key     = "terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = "us-east-1"
}

# commented out because cloudfront takes a very long time to create & destroy due to DNS registration on aws's side
# i recommend commenting this out for development whenever you need to touch the terraform configuration

# module "cloudfront" {
#     source = "./modules/cloudfront"
#     bucket_regional_domain_name = module.s3-react.bucket_domain_name
# }

module "s3-react" {
  source      = "./modules/s3-web"
  bucket_name = var.bucket_name
}

module "lambda" {
  source                    = "./modules/lambda"
  db_username               = var.db_username
  db_password               = var.db_password
}

resource "aws_s3_bucket" "scapsters-scrapstack-terraform-state" {
  bucket = "scapsters-scrapstack-terraform-state"
}
