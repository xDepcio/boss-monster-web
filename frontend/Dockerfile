# Dockerfile for bulding create-react-app image
# Use an official Node.js runtime as the base image
FROM node:22

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the React application
RUN npm run build

# Expose the port your application will listen on
EXPOSE 3006

# Start the React application
CMD ["npm", "start"]
