import { base64decode } from "nodejs-base64";
import responseError, { errorObject } from "../../answer/v1/responseError.js";

class AuthValidator {
    async registration(req, res, next) {
        next(); //нет параметров
    }

    async login(req, res, next) {
        try {
            const query: { mnemonic: string } = req.query;
            if (!query.mnemonic) return next(responseError(res, next, "mnemonic not found!", errorObject("mnemonic not found!")));

            req.query.mnemonic = base64decode(query.mnemonic);
            next(); //нет параметров
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen")));
        }

    }
}

export default new AuthValidator();