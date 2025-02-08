# # Use Node.js LTS as the base image
# FROM node:18

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json (or yarn.lock) to the working directory
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the entire project directory to the working directory in the container
# COPY . .

# ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
# ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
# ENV NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=$NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

# # Build the application for production
# RUN npm run build

# # Expose the application on port 3000
# EXPOSE 3000

# # Start the Next.js application
# CMD ["npm", "start"]

# --- Stage 1: Build ---
FROM node:18 AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies (including devDependencies, needed for building)
RUN npm ci --omit=optional  # Use ci for consistent installs

# Copy the entire project
COPY . .

# Build the NestJS application
RUN npm run build

# --- Stage 2: Production ---
FROM node:18-slim AS runner

# Set working directory
WORKDIR /usr/src/app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy *only* the necessary files from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/dist ./dist

# Install only production dependencies
RUN npm ci --omit=dev --omit=optional  # Use ci for consistent installs

# Expose the port the app listens on (default is 3000 for NestJS)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]