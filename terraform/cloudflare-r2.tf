resource "cloudflare_r2_bucket" "api_documentation_bucket" {
  account_id = var.cloudflare_account_id
  name = "scrapstack-r2-documentation"
  location = "apac"
  storage_class = "Standard"
}

resource "cloudflare_r2_managed_domain" "api_documentation_managed_domain" {
  account_id = var.cloudflare_account_id
  bucket_name = cloudflare_r2_bucket.api_documentation_bucket.id
  enabled = true
}

resource "aws_s3_object" "api_documentation_files" {
  for_each = fileset(var.api_documentation_site_path, "**")
  bucket   = cloudflare_r2_bucket.api_documentation_bucket.id
  key      = each.value
  source   = "${var.api_documentation_site_path}/${each.value}"
  # etag makes the file update when it changes; see https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag = filemd5("${var.api_documentation_site_path}/${each.value}")
  # tag content appropriately: https://stackoverflow.com/questions/76170291/how-do-i-specify-multiple-content-types-to-my-s3-object-using-terraform
  content_type = lookup(local.content_type_map, reverse(split(".", each.value))[0], "text/html")
}

locals {
  content_type_map = {
    "js"   = "text/javascript"
    "html" = "text/html"
    "css"  = "text/css"
    "svg"  = "image/svg+xml"
    "png"  = "image/png"
  }
}