FROM oven/bun:latest

WORKDIR /app

COPY package.json .
COPY package-lock.json .
RUN bun install

COPY . .

CMD ["bun", "run", "src/index.ts"]
