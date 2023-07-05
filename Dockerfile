#build step by step the environment needed for nasa project:

# select base image (ex on docker hub)
FROM node:lts-alpine

# create folder for app, where the commands will be run
WORKDIR /app

# ---------

# copy application source code to docker image: COPY . .
# BUT we only need the dependencie for now, so we copy the package.json & the package-lock.json into the app folder(./)
# therefore this layer will only be updated if there are changed in the root package.json or the client package.json
COPY package*.json ./
COPY client/package*.json client/

# --only=production (since npm8: --omit=dev) will install only the dependencies needed in prod (and not in development mode)- save space/reduce security pb
RUN npm run install-client --omit=dev

# ---------

COPY server/package*.json server/
# Good pratice: create layers in the container to minimize amount of work done by building new docker images when project is being updated
# here we separated client and server into two separate directories
RUN npm run install-server --omit=dev

# ---------

# now we copy the code of the client folder, means the build command will only run of the content of the client folder or the layers above have changed.
COPY client/ client/
# building front-end by creating public folder in server
RUN npm run build --prefix client

# ---------

COPY server/ server/ 

# security issue, user has access to the whole container here. node image will help in this case by giving less privilege to user
USER node

# starting server when the docker container starts up, will serve both API and front end
CMD [ "npm", "start", "--prefix", "server" ]

# specify the port to make it available outside of the container to the internet
EXPOSE 8000