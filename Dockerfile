FROM node:10.13.0-alpine
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 50051
CMD  ["node", "index.js"]