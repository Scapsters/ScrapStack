resource "aws_s3_bucket" "static_website" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_acl" "static_website_acl" {
  bucket = aws_s3_bucket.static_website.id
  
  depends_on = [aws_s3_bucket_ownership_controls.static_website_acl_ownership,
                aws_s3_bucket_website_configuration.static_website_configuration,
                aws_s3_bucket_public_access_block.static_website_public_access ]
  acl = "public-read"
}

resource "aws_s3_bucket_ownership_controls" "static_website_acl_ownership" {
  bucket = aws_s3_bucket.static_website.id

  rule {
    object_ownership = "ObjectWriter"
  }
}

resource "aws_s3_bucket_website_configuration" "static_website_configuration" {
    bucket = aws_s3_bucket.static_website.id

    index_document {
        suffix = var.website_index_document
    }

    error_document {
        key = var.website_error_document
    }
}

// the bucket policy
resource "aws_s3_bucket_policy" "static_website_policy" {
  bucket = aws_s3_bucket.static_website.id
  depends_on = [ aws_s3_bucket_public_access_block.static_website_public_access ]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "${aws_s3_bucket.static_website.arn}/*"
      }
    ]
  })
}

// allow acl and public policy to be created
resource "aws_s3_bucket_public_access_block" "static_website_public_access" {
  bucket = aws_s3_bucket.static_website.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

locals {
  content_type_map = {
   "js" = "text/javascript"
   "html" = "text/html"
   "css"  = "text/css"
   "svg"  = "image/svg+xml"
   "png" = "image/png"
  }
}

resource "aws_s3_object" "website_files" {
  for_each = fileset(var.website_files_path, "**")
  bucket = aws_s3_bucket.static_website.id
  key    = each.value
  source = "${var.website_files_path}/${each.value}"
  # etag makes the file update when it changes; see https://stackoverflow.com/questions/56107258/terraform-upload-file-to-s3-on-every-apply
  etag   = filemd5("${var.website_files_path}/${each.value}")
  # tag content appropriately: https://stackoverflow.com/questions/76170291/how-do-i-specify-multiple-content-types-to-my-s3-object-using-terraform
  content_type = lookup(local.content_type_map, reverse(split(".", each.value))[0], "text/html")
}