import express from 'express';
import authValidator from '../../validator/v1/authValidator.js';
import authController from '../../controller/v1/authController.js';

const routerAuth = express.Router();

routerAuth.get('/login', authValidator.login, authController.login);
routerAuth.post('/registration', authValidator.registration, authController.registration);

export default routerAuth;