FROM node:18-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app
COPY . .
ARG MONGODB_URI
ARG NAME
ARG SECRET
ARG PUBLIC_SITE_URL
ARG NEXTAUTH_URL
ARG smtpHost
ARG smtpPort
ARG smtpUser
ARG smtpPass
ARG privateKey
ARG BOT_TOKEN
ARG BOT_ID
ARG BOT_LOGIN
ARG PORT
ARG NUXT_HOST
ARG NUXT_PORT
ARG fkApiKey
ARG fkSecret1
ARG fkSecret2
ARG fkID

ENV MONGODB_URI=${MONGODB_URI}
ENV NAME=${NAME}
ENV SECRET=${SECRET}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV smtpHost=${smtpHost}
ENV smtpPort=${smtpPort}
ENV smtpUser=${smtpUser}
ENV smtpPass=${smtpPass}
ENV privateKey=${privateKey}
ENV BOT_TOKEN=${BOT_TOKEN}
ENV BOT_ID=${BOT_ID}
ENV BOT_LOGIN=${BOT_LOGIN}
ENV PORT=${PORT}
ENV NUXT_HOST=${NUXT_HOST}
ENV NUXT_PORT=${NUXT_PORT}
ENV fkApiKey=${fkApiKey}
ENV fkSecret1=${fkSecret1}
ENV fkSecret2=${fkSecret2}
ENV fkID=${fkID}


RUN npm install -g pnpm
RUN apk add --no-cache python3 make g++
RUN pnpm install
RUN pnpm run build
ENV NODE_ENV production
ENV PORT 5000

EXPOSE 5000

ENTRYPOINT ["node", "--max-old-space-size=4096", ".output/server/index.mjs"]
