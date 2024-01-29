import cors from "cors";
import express from 'express';
import config from './config.js';
import { connect } from 'mongoose';
import router from './router/index.js';
import { getPrice } from './function/rate/functionReteCoin.js';
import { createAndPushActiveUsers } from './function/active/functionActive.js';
import { generateAccount } from "tron-create-address";

const app = express();

(async function run() {
  try {
    console.log(await generateAccount());
    connect(config.mongoUrl); //connect DB

    app.use((req, res, next) => {
      const date = new Date();
      const senderIpAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}] ${req.method} - ${req.url.split("?")[0]} - ${senderIpAddress}`);
      next();
    });

    app.use(cors());
    app.use(router);
    app.use(express.json());
    app.get('/', (req, res) => res.send('localhost'));

    //создание списка активных пользователей
    createAndPushActiveUsers(1);

    //запуск функции получения курса
    startAndSchedulePriceUpdate();

    //start server
    app.listen(config.port, () => console.log("Server start! Port: " + config.port));
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();

function startAndSchedulePriceUpdate(): void {
  getPrice();
  setTimeout(getPrice, 3000000);
}
//export NODE_OPTIONS=--openssl-legacy-provider