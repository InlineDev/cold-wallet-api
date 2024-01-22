import express from 'express';
import walletValidator from '../../validator/v1/walletValidator.js';
import walletController from '../../controller/v1/walletController.js';

const routerWallet = express.Router();

routerWallet.get('/walletAddresses', walletValidator.walletAddresses, walletController.walletAddresses);

export default routerWallet;