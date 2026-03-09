FROM node:20-alpine
WORKDIR /app
COPY proxy.js .
EXPOSE 4891
CMD ["node", "proxy.js"]
