import { getUserIndex } from "../database/users";
import {
  EClientOperations,
  EServerOperations,
  TActiveUser,
  TUser,
} from "../types/types";

export const createObjForSend = (
  type: EServerOperations | EClientOperations,
  data: TActiveUser
) => ({
  type,
  data: JSON.stringify(data),
  id: 0,
});

export const createRegObj = (
  user: TUser,
  error: boolean = false,
  errorText: string = ""
) => {
  const { name } = user;
  const dataForSend: TActiveUser = {
    name: name,
    index: getUserIndex(user),
    error,
    errorText,
  };
  const objForSend = createObjForSend(EServerOperations.REG, dataForSend);
  return objForSend;
};
