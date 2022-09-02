import { useState } from "react";
// 集中处理了项目中异步操作

// 定义异步状态
interface State<D> {
  error: Error | null;
  data: D | null; //表单数据返回数据
  stat: "idle" | "loading" | "error" | "success";
}

const defaultConfig = {
  throwOnError: false,
};

// initialState是用户传入的stat，如果有就覆盖前边的状态
export const useAsync = <D>(
  initialState?: State<D>,
  initialConfig?: typeof defaultConfig
) => {
  // 初始化状态
  const defaultInitialState: State<null> = {
    stat: "idle",
    data: null,
    error: null,
  };
  // 定义真正的配置
  const config = { ...defaultConfig, ...initialConfig };
  const [state, setState] = useState<State<D>>({
    ...defaultInitialState,
    ...initialState, //后边的覆盖前边的
  });
  // 定义成功
  const setData = (data: D) =>
    setState({
      data,
      stat: "success",
      error: null,
    });
  // 定义失败
  const setError = (error: Error) =>
    setState({
      error,
      stat: "error",
      data: null,
    });

  // 发送异步请求,返回data数据，修改状态
  const run = (promise: Promise<D>) => {
    if (!promise || !promise.then) {
      throw new Error("请传入 Promise 类型数据");
    }
    setState({ ...state, stat: "loading" });
    return promise
      .then((data) => {
        setData(data);
        return data;
      })
      .catch((error) => {
        setError(error);
        if (config.throwOnError) return Promise.reject(error);
        return error;
      });
  };

  return {
    isIdle: state.stat === "idle",
    isLoading: state.stat === "loading",
    isError: state.stat === "error",
    isSuccess: state.stat === "success",
    run,
    setData,
    setError,
    ...state,
  };
};
