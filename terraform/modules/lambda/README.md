This file handles the building of Lambda, assuming there exists essentially an unzipped python package in /api/  

Lambda processes everything in between our API call getting a request and its response.  
In other words, API -> lambda -> mongo -> lambda -> API  
Lambda packages must contain all of their dependencies in the same .zip, so please install them to /api/ !