import os
import re

# --- Constants ---
TEMPLATES_DIR = "./templates"
LAMBDA_TEMPLATE = os.path.join(TEMPLATES_DIR, "gateway_resource_template.txt")
VARIABLES_TEMPLATE = os.path.join(TEMPLATES_DIR, "variables_template.txt")
OUTPUT_TEMPLATE = os.path.join(TEMPLATES_DIR, "output_template.txt")

# --- Helper Function ---
def load_template(template_path):
    with open(template_path, "r") as file:
        return file.read()

# --- Template Processing ---
def render_template(template, lambda_name, action):
    # Replace variable-like placeholders
    return template.replace("hello_world", lambda_name).replace("GET", action.upper())

# --- File Writing Helper ---
def write_file_if_not_exists(path, content):
    if os.path.exists(path):
        print(f"[SKIPPED] File already exists: {path}")
        return
    with open(path, "w") as file:
        file.write(content)
        print(f"[CREATED] File: {path}")

# --- File Editing Helper ---
def insert_into_block(file_path, resource_name, attribute, new_line):
    with open(file_path, "r") as f:
        lines = f.readlines()

    inside_resource = False
    inside_attribute = False
    indent = ""
    for i, line in enumerate(lines):
        if line.strip().startswith(f'resource "{resource_name}"'):
            inside_resource = True

        if inside_resource and line.strip().startswith(attribute):
            inside_attribute = True
            indent = re.match(r"^(\s*)", line).group(1)
            continue

        if inside_attribute and "]" in line:
            lines.insert(i, f"{indent}{new_line},\n")
            break

    with open(file_path, "w") as f:
        f.writelines(lines)

# --- Appending to file ---
def append_block_to_file(file_path, block):
    with open(file_path, "a") as f:
        f.write("\n" + block + "\n")
        print(f"[APPENDED] Block appended to: {file_path}")

# --- CLI Tool ---
def main():
    import argparse
    parser = argparse.ArgumentParser(description="Create new lambda gateway integration.")
    parser.add_argument("lambda_name", type=str, help="Lambda name in snake_case")
    parser.add_argument("action", type=str, help="HTTP method (e.g., GET, POST)")

    args = parser.parse_args()
    lambda_name = args.lambda_name
    action = args.action.upper()

    # --- Paths ---
    gateway_tf_path = f"../modules/gateway/{lambda_name}.tf"
    lambda_tf_path = "../modules/lambda/lambda.tf"
    gateway_main_tf_path = "../modules/gateway/gateway.tf"
    variables_tf_path = "../modules/gateway/variables.tf"
    outputs_tf_path = "../output.tf"
    main_tf_path = "../main.tf"

    # --- Generate gateway TF file ---
    gateway_template = load_template(LAMBDA_TEMPLATE)
    rendered = render_template(gateway_template, lambda_name, action)
    write_file_if_not_exists(gateway_tf_path, rendered)

    # --- Edit lambda.tf ---
    insert_into_block(lambda_tf_path, "null_resource", "depends_on", f"        aws_lambda_function.{lambda_name}")
    insert_into_block(lambda_tf_path, "null_resource", "command", f"rm ../api/dist/{lambda_name}.zip")

    # --- Edit gateway.tf ---
    insert_into_block(gateway_main_tf_path, "aws_api_gateway_deployment", "depends_on", f"            aws_api_gateway_integration.{lambda_name}_lambda_integration")

    # --- Append to variables.tf ---
    variables_template = load_template(VARIABLES_TEMPLATE).replace("hello_world", lambda_name)
    append_block_to_file(variables_tf_path, variables_template)

    # --- Append to output.tf ---
    output_template = load_template(OUTPUT_TEMPLATE).replace("hello_world", lambda_name).replace("GET", action)
    append_block_to_file(outputs_tf_path, output_template)

    # --- Edit main.tf ---
    insert_into_block(main_tf_path, "module \"gateway\"", "", f"    {lambda_name}_invoke_arn = module.lambda.{lambda_name}_invoke_arn")

if __name__ == "__main__":
    main()
