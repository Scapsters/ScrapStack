import json

#
# Copy lines 7-19 for every new lambda
#

# Access lambda layer
import sys
import os
sys.path.append('/opt')

# Make our python happy
sys.path.append(
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), '..', 'source'
        )
    )
)

from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

# uri_template = "mongodb+srv://{}:{}@scrapstackcluster0.kbhra5p.mongodb.net/?retryWrites=true&w=majority&appName=ScrapstackCluster0"

def hello_model():
    # Create a new client and connect to the server
    # client = MongoClient(uri_template.format(event['db_username'], event['db_password']), server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    # try:
    #     client.admin.command('ping')
    #     print("Pinged your deployment. You successfully connected to MongoDB!")
        
    # except Exception as e:
    #     print(e)

    return "hello world!"

# these local tests don't work either on my machine - I got them working? idkwym
# print(hello_world({'db_username': 'tester', 'db_password': 'yp1DVeZD1fY4zslf'}, {}))