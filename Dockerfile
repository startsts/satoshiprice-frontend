FROM ubuntu
FROM node:10.19.0
RUN ["apt", "update"]
RUN ["apt", "install", "-y", "nano"]
WORKDIR /app

ADD ./package*.json ./
RUN npm install -g npm && \
npm install -g @vue/cli
RUN npm install --only=production
COPY . WORKDIR