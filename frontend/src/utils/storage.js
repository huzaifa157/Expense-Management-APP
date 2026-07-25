import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem("token", token);
  } catch (error) {
    console.log(error);
  }
};

export const getToken = async () => {
  return await AsyncStorage.getItem("token");
};

export const removeToken = async () => {
  return await AsyncStorage.removeItem("token");
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem("user", JSON.stringify(user));
  } catch (error) {
    console.log(error);
  }
};

export const getUser = async () => {
  const value = await AsyncStorage.getItem("user");
  return value ? JSON.parse(value) : null;
};

export const removeUser = async () => {
  return await AsyncStorage.removeItem("user");
};