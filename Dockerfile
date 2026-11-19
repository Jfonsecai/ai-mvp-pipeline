FROM node:22-bookworm-slim

WORKDIR /app
COPY package.json package-lock.json ./
COPY client/package.json client/package.json
RUN npm ci

COPY . .
EXPOSE 3000 5173
CMD ["npm", "run", "dev:api"]
