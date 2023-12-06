# AIMathSolver

## Development Instructions

The web server is tightly coupled with Detectron2 and all of its dependencies. To make the development cycle easier, we used Docker to encapsulate all of the dependencies within a container. 

To deploy the project for development follow the steps below. 

1. Make sure docker daemon is installed and running on your local machine. https://docs.docker.com/get-docker/
2. Build the dockerfile in the root folder of the repo ```docker build -t <image_name> .``` This will take a while....
3. Run the docker container, there are some important steps here. ```docker run -it -p 5000:5000 -v "c:\users\aimathsolver\web":/home/detectronuser/ <image_name>```

   - ```docker run -it``` this will run the container in interactive mode, giving you a terminal to use when working
   - ```-p 5000:5000``` this will map your local port 5000 to the docker port 5000. Allow access to the server on your local machine. These can be any two ports
   - ```-v "c:\users\aimathsolver\web":/home/detectronuser/ aimathsolver:v2``` This will mount the web folder in the repo to the home/detectronuser folder in the repo. Any change made to the local files will be automatically updated in the docker container. **You do not need to restart the container after each code change.**

4. Start conda inside of the container ```. /opt/conda/etc/profile.d/conda.sh``` without this the container cannot be activated
5. Activate the conda enviornment ```conda activate local_detectron``` this has all of the dependencies automatically installed, and allows us to easily change between version of python.
6. Start the server ```python server.py```
7. If all goes well, connect to the local server on your browser. 
