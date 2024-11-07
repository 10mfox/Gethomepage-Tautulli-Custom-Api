FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Copy all application files
COPY server.js .
COPY logger.js .

EXPOSE 3008

CMD ["node", "server.js"]