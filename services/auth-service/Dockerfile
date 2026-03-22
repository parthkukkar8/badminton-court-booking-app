# Use Node.js 20 as base image
# alpine = lightweight version (smaller size)
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the code
COPY . .

# Expose the port this service runs on
EXPOSE 3001

# Command to start the service
CMD ["node", "server.js"]