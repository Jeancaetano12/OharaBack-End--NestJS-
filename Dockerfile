# Stage used only to install development tools and compile the application.
FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY nest-cli.json prisma.config.ts tsconfig.json tsconfig.build.json ./
COPY prisma ./prisma
COPY src ./src
RUN bun run build

# This target has Prisma CLI and is used once by the Compose migration service.
FROM build AS migrate
CMD ["bunx", "prisma", "migrate", "deploy"]

# The runtime image contains only production dependencies and compiled output.
FROM oven/bun:1 AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

EXPOSE 3000
CMD ["bun", "dist/src/main.js"]
