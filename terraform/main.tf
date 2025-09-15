terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5"
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

provider "aws" {
  region = "us-east-1"
  alias = "r2"
  access_key = var.R2_ACCESS_KEY
  secret_key = var.R2_SECRET_KEY
  skip_credentials_validation = true
  skip_requesting_account_id = true
  endpoints {
    s3 = "https://${var.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com"
  }
}

provider "cloudflare" {
  api_token = var.CLOUDFLARE_API_TOKEN
}

# commented out because cloudfront takes a very long time to create & destroy due to DNS registration on aws's side
# i recommend commenting this out for development whenever you need to touch the terraform configuration

# module "cloudfront" {
#     source = "./modules/cloudfront"
#     bucket_regional_domain_name = module.s3-react.bucket_domain_name
# }

module "lambda" {
  source       = "./modules/lambda"
  DB_USERNAME  = var.DB_USERNAME
  DB_PASSWORD  = var.DB_PASSWORD
  ADMIN_SECRET = var.ADMIN_SECRET
}

resource "aws_s3_bucket" "scapsters-scrapstack-terraform-state" {
  bucket = "scapsters-scrapstack-terraform-state"
}
