import express from 'express';
import withdrawalValidator from '../../validator/v1/withdrawalValidator.js';
import withdrawalController from '../../controller/v1/withdrawalController.js';

const routerWithdrawal = express.Router();

routerWithdrawal.get('/sendCoin', withdrawalValidator.sendCoin, withdrawalController.sendCoin);

export default routerWithdrawal;