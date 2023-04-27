FROM node:18-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . .

RUN npm ci && npm cache clean --force
RUN npm run build
ENV NODE_ENV production
ENV PORT 80

EXPOSE 80 

ENTRYPOINT ["node", ".output/server/index.mjs"]
