import os
import re
from datetime import datetime

# Constants
GATEWAY_TEMPLATE_PATH = "./templates/gateway_template.txt"
VARIABLES_TEMPLATE_PATH = "./templates/variable_template.txt"
OUTPUT_TEMPLATE_PATH = "./templates/output_template.txt"

# Target directories
GATEWAY_DIR = "../modules/gateway"
LAMBDA_FILE = "../modules/lambda/lambda.tf"
GATEWAY_FILE = "../modules/gateway/gateway.tf"
VARIABLES_FILE = "../modules/gateway/variables.tf"
OUTPUT_FILE = "../output.tf"
MAIN_FILE = "../main.tf"

# Utility function to load template and do placeholder substitution
def load_and_replace_template(path, placeholder, replacement):
    with open(path, 'r') as file:
        content = file.read()
    return content.replace(placeholder, replacement)

# Ensure directory exists and file doesn't already
def write_if_not_exists(path, content):
    if os.path.exists(path):
        print(f"File {path} already exists. Skipping.")
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as file:
        file.write(content)
    print(f"Created: {path}")

# Inject lambda name into a section of a file
def inject_into_file(file_path, pattern, injection, list_append=False):
    with open(file_path, 'r') as file:
        content = file.read()
    matches = list(re.finditer(pattern, content, re.DOTALL))
    if not matches:
        print(f"Pattern not found in {file_path}")
        return

    for match in matches:
        block = match.group(0)
        if injection.strip() in block:
            print(f"{file_path} already has injection. Skipping.")
            continue
        new_block = block
        if list_append:
            # Try to inject item in list
            list_match = re.search(r"(\[)([^]]*)(\])", block, re.DOTALL)
            if list_match:
                items = list_match.group(2).strip()
                if items:
                    items += f",\n            {injection.strip()}"
                else:
                    items = f"            {injection.strip()}"
                new_block = block[:list_match.start(2)] + items + block[list_match.end(2):]
        else:
            # Append to end of matched block
            new_block = block.rstrip("}") + f"\n    {injection.strip()}\n}}"

        content = content.replace(block, new_block)

    with open(file_path, 'w') as file:
        file.write(content)
    print(f"Updated: {file_path}")

# Main logic
def generate_gateway_lambda(lambda_name: str, action: str):
    var_name = lambda_name.lower()

    # 1. Create gateway resource file
    gateway_template = load_and_replace_template(GATEWAY_TEMPLATE_PATH, "hello_world", var_name)
    gateway_template = gateway_template.replace("GET", action.upper())
    gateway_file_path = os.path.join(GATEWAY_DIR, f"{lambda_name}.tf")
    write_if_not_exists(gateway_file_path, gateway_template)

    # 2. Modify lambda.tf
    depends_on_line = f"aws_lambda_function.{var_name}"
    rm_line = f"rm ../api/dist/{var_name}.zip"
    inject_into_file(
        LAMBDA_FILE,
        r'resource\s+"null_resource"\s+"delete_lambda_source_zip".+?triggers\s+=\s+{.+?}',
        f"        {depends_on_line}",
        list_append=True
    )
    inject_into_file(
        LAMBDA_FILE,
        r'command\s+=\s+<<EOT(.+?)EOT',
        f"{rm_line}",
        list_append=False
    )

    # 3. Update gateway.tf deployment block
    inject_into_file(
        GATEWAY_FILE,
        r'resource\s+"aws_api_gateway_deployment"\s+"deployment".+?rest_api_id.+?}',
        f"aws_api_gateway_integration.{var_name}_lambda_integration",
        list_append=True
    )

    # 4. Append to variables.tf
    var_block = load_and_replace_template(VARIABLES_TEMPLATE_PATH, "hello_world", var_name)
    with open(VARIABLES_FILE, 'a') as file:
        file.write("\n" + var_block)
    print(f"Appended variable: {VARIABLES_FILE}")

    # 5. Append to output.tf
    output_block = load_and_replace_template(OUTPUT_TEMPLATE_PATH, "hello_world", var_name)
    with open(OUTPUT_FILE, 'a') as file:
        file.write("\n" + output_block)
    print(f"Appended output: {OUTPUT_FILE}")

    # 6. Update main.tf
    inject_into_file(
        MAIN_FILE,
        r'module\s+"gateway"\s+{[^}]+}',
        f"{var_name}_invoke_arn = module.lambda.{var_name}_invoke_arn",
        list_append=False
    )

# Example usage
generate_gateway_lambda("my_lambda_name", "GET")