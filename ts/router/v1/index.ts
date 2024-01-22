import express from 'express';
import routerAuth from './authRouter.js';
import routerUser from './userRouter.js';
import routerWallet from './walletRouter.js';
import routerBalance from './balanceRouter.js';
import routerWithdrawal from './withdrawalRouter.js';
import transactionRouter from './transactionRouter.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const routerV1 = express.Router();

routerV1.use("/auth", routerAuth);
routerV1.use("/user", authMiddleware, routerUser);
routerV1.use("/wallet", authMiddleware, routerWallet);
routerV1.use("/balance", authMiddleware, routerBalance);
routerV1.use("/withdrawal", authMiddleware, routerWithdrawal);
routerV1.use("/transaction", authMiddleware, transactionRouter);

export default routerV1;