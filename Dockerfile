FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN npm ci

COPY . .

CMD ["bun", "run", "src/index.ts"]
