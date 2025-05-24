# Setup

## Development
1. in /client, run `npm run dev`

## Staging
1. Install terraform CLI (+ AWS CLI + AWS Account)
2. in `/client`, run `npm run build` -> This should create a /client/dist folder
3. in `/terraform`, run `terraform plan` (+ provide variables)
4. **REVIEW TERRAFORMS PLAN**
5. run `terraform apply`
6. check output from cmd OR from `/terraform/terraform.tfstate`

## Production
Don't do this unless you own the production resources (are Scott). Staging, except:
3. Provide production variables