import userService from "../../service/v1/userService.js";
import responseSuccess from "../../answer/v1/responseSuccess.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";

class UserController {
    async infoUser(req, res, next) {
        try {
            const infoUserService = await userService.infoUser(req.user);
            if (infoUserService.status === "error") return next(responseError(res, next, infoUserService.logErr, errorObject(infoUserService.error.message)));

            return next(responseSuccess(res, next, infoUserService));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new UserController();