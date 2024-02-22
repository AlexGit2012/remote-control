import { TUser } from "../types/types";

let users: TUser[] = [];

export const getUsers = (): TUser[] => users;

export const addUser = (user: TUser) => {
  if (!findUser(user)) {
    users.push(user);
  }
};

export const updateUser = (userWithNewData: TUser) => {
  if (isUserExists(userWithNewData)) {
    const userIndex = getUserIndex(userWithNewData);
    const userInDB = findUser(userWithNewData);
    users[userIndex] = Object.assign({}, userInDB, userWithNewData);
    return true;
  } else return false;
};

export const findUser = (user: TUser) => {
  const { name: userName } = user;
  return users.find(({ name }) => name === userName);
};

export const getUserIndex = (user: TUser) => {
  return users.findIndex(({ name }) => name === user.name);
};

export const isUserExists = (user: TUser) => !!findUser(user);
