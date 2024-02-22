export const cloneObj = (obj: Object) => JSON.parse(JSON.stringify(obj));

export const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};
