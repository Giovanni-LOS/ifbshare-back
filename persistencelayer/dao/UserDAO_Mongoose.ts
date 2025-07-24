import { IUserDAO } from "./IUserDAO";
import userModel from "../../models/user.model";
import { UserDTO } from "../persistence/UserDTO";
import { Types } from "mongoose";

class UserDAO_Mongoose implements IUserDAO {
    private convertToDTO(userObj: Record<string, unknown>): UserDTO {
        return {
            id: (userObj._id as Types.ObjectId).toString(),
            nickname: userObj.nickname as string,
            email: userObj.email as string,
            verified: userObj.verified as boolean,
            degree: userObj.degree,
            picture: userObj.picture ? (userObj.picture as Buffer).toString('base64') : undefined,
            createdAt: userObj.createdAt as Date,
            updatedAt: userObj.updatedAt as Date
        } as UserDTO;
    }

    async save(user: UserDTO): Promise<UserDTO> {
        const newUser = new userModel(user);
        const savedUser = await newUser.save();
        return this.convertToDTO(savedUser.toObject());
    }

    async findById(id: string): Promise<UserDTO | null> {
        const user = await userModel.findById(id);
        return user ? this.convertToDTO(user.toObject()) : null;
    }

    async findByEmail(email: string): Promise<UserDTO | null> {
        const user = await userModel.findOne({ email });
        return user ? this.convertToDTO(user.toObject()) : null;
    }

    async findByNickname(nickname: string): Promise<UserDTO | null> {
        const user = await userModel.findOne({ nickname });
        return user ? this.convertToDTO(user.toObject()) : null;
    }

    async update(user: UserDTO): Promise<void> {
        await userModel.findByIdAndUpdate(user.id, user);
    }

    async delete(id: string): Promise<void> {
        await userModel.findByIdAndDelete(id);
    }

    // Special method for authentication that includes password
    async findByEmailWithPassword(email: string): Promise<{ user: UserDTO; password: string } | null> {
        const user = await userModel.findOne({ email });
        if (!user) return null;
        
        const userObj = user.toObject();
        return {
            user: this.convertToDTO(userObj),
            password: userObj.password as string
        };
    }

    // Special method for creating user with password
    async saveWithPassword(userData: { nickname: string; email: string; password: string; verified?: boolean; degree?: unknown }): Promise<UserDTO> {
        const newUser = new userModel(userData);
        const savedUser = await newUser.save();
        return this.convertToDTO(savedUser.toObject());
    }

    // Special method for updating password
    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await userModel.findByIdAndUpdate(userId, { password: hashedPassword });
    }
}

export default UserDAO_Mongoose;