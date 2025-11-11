FROM node:20-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install
RUN rm -rf node_modules package-lock.json && npm install
COPY . .
RUN npm run build

FROM node:20-slim AS runner

RUN npm install -g serve

COPY --from=builder /app/dist /usr/app/www

EXPOSE 3000

CMD ["serve", "-s", "/usr/app/www", "-l", "3000"]
