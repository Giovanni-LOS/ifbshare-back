import { IUserDAO } from "./IUserDAO";
import userModel from "../../models/user.model";
import { UserDTO } from "../persistence/UserDTO";

class UserDAO_Mongoose implements IUserDAO {
    async save(user: UserDTO): Promise<UserDTO> {
        const newUser = new userModel(user);
        const savedUser = await newUser.save();
        return savedUser.toJSON() as UserDTO;
    }

    async findById(id: string): Promise<UserDTO | null> {
        const user = await userModel.findById(id);
        return user ? user.toJSON() as UserDTO : null;
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        const user = await userModel.findOne({ email });
        return user ? user.toJSON() as UserDTO : null;
    }

    async findByNickname(nickname: string): Promise<UserDTO | null> {
        const user = await userModel.findOne({ nickname });
        return user ? user.toJSON() as UserDTO : null;
    }

    async update(user: UserDTO): Promise<void> {
        await userModel.findByIdAndUpdate(user.id, user);
    }

    async delete(id: string): Promise<void> {
        await userModel.findByIdAndDelete(id);
    }
}

export default UserDAO_Mongoose;