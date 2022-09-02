import React, { ReactNode } from "react";
import * as auth from "../utils/auth-provider";
import { User } from "../utils/auth-provider";
import { http } from "utils/use-http";
import { useMount } from "utils/utils";
import { useAsync } from "utils/use-async";
import { FullPageErrorFallback, FullPageLoading } from "components/lib";

// 表单数据
interface AuthForm {
  username: string;
  password: string;
}
// 定义user信息，登录注册登出操作
interface AuthContext {
  user: User | null;
  register: (form: AuthForm) => Promise<void>;
  login: (form: AuthForm) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContext | undefined>(undefined);

// props.children获取后代元素，获取相关信息并发送请求
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    data: user,
    error,
    isLoading,
    isIdle,
    isError,
    run,
    setData: setUser,
  } = useAsync<User | null>();

  // 初始化，先拿token，防止登录后刷新返回首页
  const bootstrapUser = async () => {
    let user = null;
    const token = auth.getToken();
    if (token) {
      const data = await http("me", { token });
      user = data.user;
    }
    return user;
  };
  useMount(() => {
    run(bootstrapUser());
  });
  //
  if (isIdle || isLoading) {
    return <FullPageLoading />;
  }
  if (isError) {
    return <FullPageErrorFallback error={error} />;
  }
  // 发送请求操作
  const login = (form: AuthForm) => auth.login(form).then(setUser);
  const register = (form: AuthForm) => auth.register(form).then(setUser);
  const logout = () => auth.logout().then(() => setUser(null));

  // 渲染页面，传递context
  return (
    <AuthContext.Provider
      value={{ user, login, register, logout }}
      children={children}
    />
  );
};

// 使用context
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth必须在AuthProvider中使用");
  }
  return context;
};
