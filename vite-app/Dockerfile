# Use Node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies (including curl for health checks)
COPY package*.json ./
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    npm install && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy all source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
