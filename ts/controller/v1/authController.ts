import authService from "../../service/v1/authService.js";
import responseSuccess from "../../answer/v1/responseSuccess.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";


class AuthController {
    async registration(req, res, next) {
        try {
            const registrationService = await authService.registration();
            if (registrationService.status === "error") return next(responseError(res, next, registrationService.logErr, errorObject(registrationService.error.message)));

            return next(responseSuccess(res, next, registrationService));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }

    async login(req, res, next) {
        try {
            const loginService = await authService.login(req.query.mnemonic);
            if (loginService.status === "error") return next(responseError(res, next, loginService.logErr, errorObject(loginService.error.message)));

            return next(responseSuccess(res, next, loginService));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new AuthController();