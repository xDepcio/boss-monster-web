# Use an official Node.js runtime as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code to the working directory
COPY . .

# Build the TypeScript project
RUN npm run only-build-ts

# Expose the port your application will listen on
EXPOSE 3001

# Start the Express application
CMD ["node", "build/src/app.js"]
