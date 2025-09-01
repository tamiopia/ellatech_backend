FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL dependencies (including dev) for building
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and keep only production
RUN npm ci --only=production && \
    npm cache clean --force

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]