import { UserDTO } from "../persistence/UserDTO";

export interface IUserDAO {
    save(user: UserDTO): Promise<UserDTO>;
    findById(id: string): Promise<UserDTO | null>;
    findByEmail(email: string): Promise<UserDTO | null>;
    findByNickname(nickname: string): Promise<UserDTO | null>;
    update(user: UserDTO): Promise<void>;
    delete(id: string): Promise<void>;
    findByEmailWithPassword(email: string): Promise<{ user: UserDTO; password: string } | null>;
    saveWithPassword(userData: { nickname: string; email: string; password: string; verified?: boolean; degree?: unknown }): Promise<UserDTO>;
    updatePassword(userId: string, hashedPassword: string): Promise<void>;
}