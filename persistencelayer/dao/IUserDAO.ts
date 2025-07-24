import { UserDTO } from "../persistence/UserDTO";

export interface IUserDAO {
    save(user: UserDTO): Promise<UserDTO>;
    findById(id: string): Promise<UserDTO | null>;
    findByEmail(email: string): Promise<UserDTO | null>;
    update(user: UserDTO): Promise<void>;
    delete(id: string): Promise<void>;
}