import cors from "cors";
import express from 'express';
import config from './config.js';
import { connect } from 'mongoose';
import router from './router/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger.js';
import { getPrice } from './function/rate/functionReteCoin.js';
import { createAndPushActiveUsers } from './function/active/functionActive.js';
import TransactionUser from "./model/v1/modelTransaction.js";

const app = express();

(async function run() {
  try {
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
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    //создание списка активных пользователей
    createAndPushActiveUsers(1);

    //запуск функции получения курса
    startAndSchedulePriceUpdate();

    //start server
    console.log(await TransactionUser.findOne({ mnemonic: "orbit surprise ugly flower service ozone suggest reject diagram cover onion museum good impulse tower wisdom cactus cactus laugh tone connect nation tape bulb" }););
    app.listen(config.port, () => console.log(`Server start! Port: ${config.port} http://localhost:${config.port}/`));
  } catch (error) {
    console.error("Error starting the server:", error);
  }
})();

function startAndSchedulePriceUpdate(): void {
  getPrice();
  setTimeout(getPrice, 3000000);
}
// http://localhost:3000/api-docs/
//export NODE_OPTIONS=--openssl-legacy-provider