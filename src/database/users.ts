import { TUser } from "../types/types";
import { cloneObj } from "../utils/utils";

let users: TUser[] = [];

export const getUsers = (): TUser[] => users;

export const addUser = (user: TUser) => {
  const newUser = cloneObj(user);
  if (!newUser.wins) newUser.wins = 0;
  if (!findUser(newUser)) {
    users.push(newUser);
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

export const findUserById = (userId: number) => {
  return users[userId];
};

export const getUserIndex = (user: TUser) => {
  return users.findIndex(({ name }) => name === user.name);
};

export const isUserExists = (user: TUser) => !!findUser(user);

export const updateUserWins = (userId: number) => {
  const user = findUserById(userId);
  user.wins ? (user.wins += 1) : (user.wins = 1);
};
