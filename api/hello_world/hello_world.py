import json
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# uri_template = "mongodb+srv://{}:{}@scrapstackcluster0.kbhra5p.mongodb.net/?retryWrites=true&w=majority&appName=ScrapstackCluster0"

def hello_world(event, context):
    # Create a new client and connect to the server
    # client = MongoClient(uri_template.format(event['db_username'], event['db_password']), server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    # try:
    #     client.admin.command('ping')
    #     print("Pinged your deployment. You successfully connected to MongoDB!")
        
    # except Exception as e:
    #     print(e)

    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps({
            "message": "Hello world!"
        })
    }

    return response

# these local tests don't work either on my machine
# print(hello_world({'db_username': 'tester', 'db_password': 'yp1DVeZD1fY4zslf'}, {}))