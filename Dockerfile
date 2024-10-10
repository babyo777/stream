# Use the official Node.js image from Docker Hub
FROM node:18

# Set the working directory inside the container
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install --productio

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
