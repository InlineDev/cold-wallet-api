import express from 'express';
import transactionValidator from '../../validator/v1/transactionValidator.js';
import transactionController from '../../controller/v1/transactionController.js';

const routerTransaction = express.Router();

routerTransaction.get('/find', transactionValidator.find, transactionController.find);

export default routerTransaction;