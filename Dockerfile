# Use Node.js LTS as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire project directory to the working directory in the container
COPY . .

# Build the application for production
RUN npm run build

# Expose the application on port 3000
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
