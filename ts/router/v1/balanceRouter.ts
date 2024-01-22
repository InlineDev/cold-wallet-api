import express from 'express';
import balanceValidator from '../../validator/v1/balanceValidator.js';
import balanceController from '../../controller/v1/balanceController.js';

const routerBalance = express.Router();

routerBalance.get('/balance', balanceValidator.balance, balanceController.balance);

export default routerBalance;