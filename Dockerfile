FROM node:boron

WORKDIR /usr/src/claimclaim

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]