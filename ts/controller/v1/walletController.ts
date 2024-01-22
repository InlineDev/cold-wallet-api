import walletService from "../../service/v1/walletService.js";
import responseSuccess from "../../answer/v1/responseSuccess.js";
import responseError, { errorObject } from "../../answer/v1/responseError.js";

class WalletController {
    async walletAddresses(req, res, next) {
        try {
            const walletAddressesService = await walletService.walletAddresses(req.user);
            if (walletAddressesService.status === "error") return next(responseError(res, next, walletAddressesService.logErr, errorObject(walletAddressesService.error.message)));

            return next(responseSuccess(res, next, walletAddressesService));
        } catch (err) {
            return next(responseError(res, next, err, errorObject("unforeseen!")));
        }
    }
}

export default new WalletController();