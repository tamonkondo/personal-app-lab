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
COPY --from=build /app/apps/portal/dist /usr/share/nginx/html
COPY --from=build /app/apps/notion-training-app/dist /usr/share/nginx/html/notion-training-app
COPY --from=build /app/apps/app2/dist /usr/share/nginx/html/app2

EXPOSE 80
