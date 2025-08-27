# Add lambdas automatically in several places throughout our terraform files.

import os
import argparse

ROOT_DIR        = ".."
LAMBDA_DIR      = "../modules/lambda"
GATEWAY_DIR     = "../modules/gateway"
TEMPLATES_DIR   = "./templates"
    
def find_text(template: list[str], text: str):
    for i, line in enumerate(template):
        if line.find(text) != -1:
            return i
    return -1

# Markers are specific comments in terraform files  
def insert_above_marker(filepath: str, marker: str, text: str, do_add: bool):
    with open(filepath, "r") as file:
        lines = file.readlines() 
    
    # Find the marker and add above it, OR find the text and delete it
    if do_add:
        marker_index = find_text(lines, marker)
        if marker_index == -1:
            return
        lines.insert(marker_index, text + "\n")
    else:
        text_index = find_text(lines, text)
        if text_index == -1:
            return
        lines.pop(text_index)
    
    with open(filepath, "w") as file:
        file.writelines(lines)

# Format a template and insert it somewhere
def use_template(template_path: str, destination_path: str, lambda_name: str, action: str, do_append: bool, do_add: bool):
    with open(template_path, "r") as file:
        template = file.read().replace("{name}", lambda_name).replace("{action}", action)
    
    if do_add:
        with open(destination_path, "a" if do_append else "w") as file:
            file.write(f"{template}\n")
        return
    
    if not do_append:
        if os.path.exists(destination_path):
            os.remove(destination_path)
        return

    with open(destination_path, "r") as file:
        current = file.read()
        
    new = current.replace(f"{template}\n", "")
    
    with open(destination_path, "w") as file:
        file.write(new)
    
# Follows adding_lambdas.excalidraw
def main():
    parser = argparse.ArgumentParser(description="Create new lambda")
    parser.add_argument("do_add", type=str, help="add or delete")
    parser.add_argument("lambda_name", type=str, help="Lambda name in snake_case")
    parser.add_argument("action", type=str, help="HTTP method (e.g., GET, POST)")
    args = parser.parse_args()
    if args.do_add != "add" and args.do_add != "delete":
        print("must enter add or delete for first argument.")
    do_add = args.do_add == "add"
    lambda_name = args.lambda_name
    action = args.action.upper()
    
    # Lambda changes
    use_template(
        f"{TEMPLATES_DIR}/lambda_main.template", 
        f"{LAMBDA_DIR}/{lambda_name}.tf", 
        lambda_name, 
        action,
        do_append = False,
        do_add = do_add
    )
    insert_above_marker(
        f"{LAMBDA_DIR}/lambda.tf", 
        "this is the command marker for the build tool",
        f"rm ../api/dist/{lambda_name}.zip",
        do_add = do_add
    )
    insert_above_marker(
        f"{LAMBDA_DIR}/lambda.tf", 
        "this is the depends_on marker for the build tool",
        f"    aws_lambda_function.{lambda_name},",
        do_add = do_add
    )
    
    # Gateway changes
    use_template(
        f"{TEMPLATES_DIR}/gateway_main.template",
        f"{GATEWAY_DIR}/{lambda_name}.tf",
        lambda_name,
        action,
        do_append = False,
        do_add = do_add
    )
    insert_above_marker(
        f"{GATEWAY_DIR}/gateway.tf",
        "this is the depends_on marker for the build tool",
        f"    aws_api_gateway_integration.{lambda_name}_lambda_integration,",
        do_add = do_add
    )
    use_template(
        f"{TEMPLATES_DIR}/gateway_invoke_arn_variable.template",
        f"{GATEWAY_DIR}/variables.tf",
        lambda_name,
        action,
        do_append = True,
        do_add = do_add
    )
    use_template(
        f"{TEMPLATES_DIR}/gateway_endpoint_url_output.template",
        f"{GATEWAY_DIR}/output.tf",
        lambda_name,
        action,
        do_append = True,
        do_add = do_add
    )
    
    # Main changes
    use_template(
        f"{TEMPLATES_DIR}/output_main.template",
        f"{ROOT_DIR}/output.tf",
        lambda_name,
        action,
        do_append = True,
        do_add = do_add
    )
    insert_above_marker(
        f"{ROOT_DIR}/main.tf",
        "this is the invoke arn marker for the build tool",
        f"  {lambda_name}_invoke_arn = module.lambda.{lambda_name}_invoke_arn",
        do_add = do_add
    )
    
main()