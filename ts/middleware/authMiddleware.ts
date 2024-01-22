import tokenService from "../service/v1/tokenService.js";
import responseError, { errorObject } from "../answer/v1/responseError.js";
import { createAndPushActiveUsers } from "../function/active/functionActive.js";

export default async function (req, res, next) {
    try {
        const authrizationHeader: string = req.headers.authorization;
        const accessToken: string = authrizationHeader.split(" ")[1];
        const userData = tokenService.validateAccessToken(accessToken);

        if (!authrizationHeader || !accessToken || !userData) return next(responseError(res, next, "Not Authorized!", errorObject("Not Authorized!")));


        createAndPushActiveUsers(userData.id);
        req.user = userData;
        next();
    } catch (err) {
        return next(responseError(res, next, err, errorObject("unforeseen")));
    }
}