import ActiveUsersList from "../../model/v1/modelActiveUsersList.js";

export async function createAndPushActiveUsers(idActiveUser): Promise<void> {
    const activeUserList = await ActiveUsersList.findOne({ date: new Date().toLocaleDateString("ua") });
    if (!activeUserList) {
        await ActiveUsersList.create({ date: new Date().toLocaleDateString("ua"), usersList: [{ id: idActiveUser }] });
    } else {
        const userExists = activeUserList.usersList.some(user => user.id === idActiveUser);
        if (!userExists) {
            await activeUserList.usersList.push({ id: idActiveUser });
            await activeUserList.save();
        }
    }
}