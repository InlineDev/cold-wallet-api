import express from 'express';
import userValidator from '../../validator/v1/userValidator.js';
import userController from '../../controller/v1/userController.js';

const routerUser = express.Router();

routerUser.get('/infoUser', userValidator.infoUser, userController.infoUser);

export default routerUser;