import os
import argparse
from pathlib import Path
from string import Template

# Define paths
BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "../templates"
MODULES_GATEWAY_DIR = BASE_DIR / "../modules/gateway"
LAMBDA_TF_PATH = BASE_DIR / "../modules/lambda/lambda.tf"
GATEWAY_TF_PATH = BASE_DIR / "../gateway/gateway.tf"
VARIABLES_TF_PATH = BASE_DIR / "../gateway/variables.tf"
OUTPUT_TF_PATH = BASE_DIR / "../output.tf"
MAIN_TF_PATH = BASE_DIR / "../main.tf"

def read_template(template_name, substitutions):
    template_path = TEMPLATE_DIR / template_name
    with open(template_path) as f:
        content = Template(f.read())
    return content.substitute(substitutions)

def write_file_if_not_exists(file_path, content):
    if file_path.exists():
        print(f"File {file_path} already exists. Skipping.")
        return
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Created file: {file_path}")

def append_to_file(file_path, content):
    with open(file_path, 'a') as f:
        f.write("\n" + content)
    print(f"Appended content to: {file_path}")

def modify_file(file_path, search_pattern, insert_line):
    with open(file_path, 'r+') as f:
        lines = f.readlines()
        for idx, line in enumerate(lines):
            if search_pattern in line:
                if insert_line not in lines:
                    lines.insert(idx + 1, insert_line + '\n')
                break
        f.seek(0)
        f.writelines(lines)
        f.truncate()
    print(f"Modified file: {file_path}")

def main(lambda_name, http_method):
    substitutions = {
        'lambda_name': lambda_name,
        'http_method': http_method.upper()
    }

    # Step 1: Create gateway Terraform file
    gateway_tf_content = read_template("gateway_template.tf", substitutions)
    gateway_tf_path = MODULES_GATEWAY_DIR / f"{lambda_name}.tf"
    write_file_if_not_exists(gateway_tf_path, gateway_tf_content)

    # Step 2: Modify lambda.tf
    modify_file(
        LAMBDA_TF_PATH,
        'depends_on = [',
        f'        aws_lambda_function.{lambda_name},'
    )
    modify_file(
        LAMBDA_TF_PATH,
        'rm ../api/dist/source.zip',
        f'        rm ../api/dist/{lambda_name}.zip'
    )

    # Step 3: Modify gateway.tf
    modify_file(
        GATEWAY_TF_PATH,
        'depends_on = [',
        f'        aws_api_gateway_integration.{lambda_name}_lambda_integration,'
    )

    # Step 4: Append to variables.tf
    variable_tf_content = read_template("variable_template.tf", substitutions)
    append_to_file(VARIABLES_TF_PATH, variable_tf_content)

    # Step 5: Append to output.tf
    output_tf_content = read_template("output_template.tf", substitutions)
    append_to_file(OUTPUT_TF_PATH, output_tf_content)

    # Step 6: Modify main.tf
    modify_file(
        MAIN_TF_PATH,
        'module "gateway" {',
        f'    {lambda_name}_invoke_arn = module.lambda.{lambda_name}_invoke_arn'
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate Terraform files for a new Lambda function.")
    parser.add_argument("lambda_name", help="Name of the Lambda function (e.g., my_lambda_name)")
    parser.add_argument("http_method", help="HTTP method (e.g., GET, POST)")
    args = parser.parse_args()
    main(args.lambda_name, args.http_method)
