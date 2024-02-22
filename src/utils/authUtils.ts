import { findUser, isUserExists } from "../database/users";
import { TUser } from "../types/types";

export const auth = (user: TUser) => {
  if (isUserExists(user)) {
    return !!(findUser(user)?.password === user.password);
  } else return null;
};
