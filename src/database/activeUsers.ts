import { TActiveUser } from "../types/types";

let activeUsers: TActiveUser[] = [];

export const addActiveUser = (user: TActiveUser) => {
  if (!findActiveUser(user)) {
    activeUsers.push(user);
  }
};

export const findActiveUser = (user: TActiveUser) => {
  const { name: userName } = user;
  return activeUsers.find(({ name }) => {
    name === userName;
  });
};

export const isActiveUserExists = (user: TActiveUser) => !!findActiveUser(user);
