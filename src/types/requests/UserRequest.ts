// import { UserEntity } from "../../entities/user.entity";

export class UserRequest {
  userData: User[];
}

export class User {
  id_user: number;
  avatarUrl?: string;
  isActive?: boolean;
}


