export default class UserDto {
    id;
    mnemonic;

    constructor(model) {
        this.id = model.id;
        this.mnemonic = model.mnemonic;
    }
}