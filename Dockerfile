FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install

# Copy all project files
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Start production image build
FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY --from=build /app/package*.json ./
COPY --from=build /app/server.js ./
COPY --from=build /app/logger.js ./
COPY --from=build /app/config.js ./

# Install production dependencies
RUN npm install --production

# Copy frontend build
COPY --from=build /app/frontend/build ./frontend/build

# Create config directory
RUN mkdir -p config

# Create volume for persistent config
VOLUME /app/config

CMD ["node", "server.js"]