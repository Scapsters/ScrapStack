# resource "cloudflare_worker" "api_docs_endpoint" {
#   account_id = var.account_id
#   name = "api_docs_endpoint"
#   logpush = true
#   observability = {
#     enabled = true
#     head_sampling_rate = 0
#     logs = {
#       enabled = true
#       head_sampling_rate = 0
#       invocation_logs = true
#     }
#   }
#   subdomain = {
#     enabled = true
#     previews_enabled = true
#   }
#   tags = ["scrapstack"]
# }

# resource "cloudflare_worker_version" "example_worker_version" {
#   account_id = var.account_id
#   worker_id = cloudflare_worker.api_docs_endpoint.id
#   assets = {
#     config = {
#       html_handling = "auto-trailing-slash"
#       not_found_handling = "404-page"
#       run_worker_first = ["string"]
#     }
#     jwt = "jwt"
#   }
#   bindings = [{
#     name = "MY_ENV_VAR"
#     text = "my_data"
#     type = "plain_text"
#   }]
#   compatibility_date = "2025-09-10"
#   main_module = "index.js"
#   modules = [{
#     content_file = "dist/index.js"
#     content_type = "application/javascript+module"
#     name = "index.js"
#   }]
#   placement = {
#     mode = "smart"
#   }
# }