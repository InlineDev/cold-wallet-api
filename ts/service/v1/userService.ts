import ModelUser from '../../model/v1/modelUser.js';

class UserService {
    async infoUser(reqUser) {
        try {
            const user = await ModelUser.findOne({ mnemonic: reqUser.mnemonic });
            user.mnemonic = "*****";
            return {
                status: "OK",
                data: { user },
                error: {},
            };
        } catch (err) {
            return {
                status: "error",
                data: {},
                error: {
                    message: "unforeseen!"
                },
                logErr: err
            }
        }
    }
}

export default new UserService();