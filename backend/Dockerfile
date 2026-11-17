# Build the TypeScript app, then run a slim production image.
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-slim AS run
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
# compiled JS and the SQL schema the migrate step reads
COPY --from=build /app/dist ./dist
COPY --from=build /app/src/schema.sql ./dist/schema.sql
EXPOSE 8080
CMD ["node", "dist/index.js"]
