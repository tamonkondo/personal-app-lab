FROM node:24-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

WORKDIR /app

RUN corepack enable

COPY . .

RUN pnpm install --frozen-lockfile
RUN pnpm build

FROM nginx:1.27-alpine AS runtime

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/personal-app/dist /usr/share/nginx/html

EXPOSE 80
