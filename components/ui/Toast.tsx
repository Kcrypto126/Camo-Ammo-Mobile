import { Platform } from "react-native";

export const showToast = (msg: string) => {
  if (Platform.OS === "android") {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const ToastAndroid = require("react-native").ToastAndroid;
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    // eslint-disable-next-line no-alert
    alert(msg);
  }
};
