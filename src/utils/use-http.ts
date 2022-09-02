import qs from "qs";
import * as auth from "./auth-provider";
import { useAuth } from "context/auth-context";

// 封装发送携带token的http请求

// 增加token和data到fetch的配置
interface Config extends RequestInit {
  token?: string;
  data?: object; //查询表单的数据，根据id返回数据
}
const apiUrl = process.env.REACT_APP_API_URL;

// 参数是url后面的字符，把获取到的data返回出来
export const http = async (endpoint: string, defaultConfig: Config) => {
  const { data, token } = defaultConfig;
  const config = {
    method: "GET",
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": data ? "application/json" : "",
    },
  };
  //拼接到url
  if (config.method.toUpperCase() === "GET") {
    endpoint += `?${qs.stringify(data)}`;
  } else {
    throw Error("请求方式不正确");
  }

  return window
    .fetch(`${apiUrl}/${endpoint}`, config)
    .then(async (response) => {
      if (response.status === 401) {
        await auth.logout();
        window.location.reload();
        return Promise.reject({ message: "请重新登录" });
      }
      const data = await response.json();
      if (response.ok) {
        return data;
      } else {
        return Promise.reject(data);
      }
    });
};

// 执行函数，传入数组，请求然后执行，存入token
export const useHttp = () => {
  const { user } = useAuth();
  return (...[endpoint, config]: Parameters<typeof http>) =>
    http(endpoint, { ...config, token: user?.token });
};
