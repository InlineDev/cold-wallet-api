import mongoose from "mongoose";

interface User {
    id: number;
}

interface ObjectActiveUsersList {
    date: string;
    usersList: User[]; // Типизируем массив объектами типа User
}

const activeUsersListSchema = new mongoose.Schema<ObjectActiveUsersList>({
    date: { type: String, required: true },
    usersList: [{ id: Number }] // Здесь указываем тип массива объектов
});

const ActiveUsersList = mongoose.model<ObjectActiveUsersList>("ActiveUsersList", activeUsersListSchema);

export default ActiveUsersList;
