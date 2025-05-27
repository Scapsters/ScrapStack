# Add lambdas automatically in several places throughout our terraform files.

import os
import argparse

ROOT_DIR        = ".."
LAMBDA_DIR      = "../modules/lambda"
GATEWAY_DIR     = "../modules/gateway"
TEMPLATES_DIR   = "./templates"
    
def find_marker(template: list[str], marker: str):
    for i, line in enumerate(template):
        if line.find(marker) != -1:
            return i
    return -1

# Markers are specific comments in terraform files  
def insert_above_marker(filepath: str, marker: str, text: str):
    with open(filepath, "r") as file:
        lines = file.readlines() 
    
    marker_index = find_marker(lines, marker)
    lines.insert(marker_index, text)
    
    with open(filepath, "w") as file:
        file.writelines(lines)

# Format a template and insert it somewhere
def use_template(template_path: str, destination_path: str, lambda_name: str, action: str, do_append: bool = False):
    with open(template_path, "r") as file:
        template = file.read()
        
    template.replace("{lambda_name}", lambda_name)
    template.replace("{action}", action)
    
    with open(destination_path, "a" if do_append else "w") as file:
        file.write(template + "\n")
    
# Follows adding_lambdas.excalidraw
def main():
    parser = argparse.ArgumentParser(description="Create new lambda")
    parser.add_argument("lambda_name", type=str, help="Lambda name in snake_case")
    parser.add_argument("action", type=str, help="HTTP method (e.g., GET, POST)")
    args = parser.parse_args()
    lambda_name = args.lambda_name
    action = args.action.upper()
    
    # Lambda changes
    use_template(
        f"{TEMPLATES_DIR}/lambda_main.template", 
        f"{LAMBDA_DIR}/{lambda_name}.tf", 
        lambda_name, 
        action,
        do_append = False
    )
    insert_above_marker(
        f"{LAMBDA_DIR}/lambda.tf", 
        "this is the command marker for the build tool",
        f"rm ../api/dist/{lambda_name}.zip"
    )
    insert_above_marker(
        f"{LAMBDA_DIR}/lambda.tf", 
        "this is the depends_on marker for the build tool",
        f"    aws_lambda_function.{lambda_name},"
    )
    
    # Gateway changes
    use_template(
        f"{TEMPLATES_DIR}/gateway_main.template",
        f"{GATEWAY_DIR}/{lambda_name}.tf",
        lambda_name,
        action,
        do_append = False
    )
    insert_above_marker(
        f"{GATEWAY_DIR}/gateway.tf",
        "this is the depends_on marker for the build tool",
        f"    aws_api_gateway_integration.{lambda_name}_lambda_integration,"
    )
    use_template(
        f"{TEMPLATES_DIR}/gateway_invoke_arn_variable.template",
        f"{GATEWAY_DIR}/variables.tf",
        lambda_name,
        action,
        do_append = True
    )
    
    # Main changes
    use_template(
        f"{TEMPLATES_DIR}/output_main.template",
        f"{ROOT_DIR}/output.tf",
        lambda_name,
        action,
        do_append = True
    )
    insert_above_marker(
        f"{ROOT_DIR}/main.tf",
        "this is the invoke arn marker for the build tool",
        f"  {lambda_name}_invoke_arn = module.lambda.{lambda_name}_invoke_arn"
    )