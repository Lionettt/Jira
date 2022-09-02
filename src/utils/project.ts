import { useAsync } from "utils/use-async";
import { Project } from "screens/authenticatedApp/project-list/list";
import { useEffect } from "react";
import { cleanObject } from "utils/utils";
import { useHttp } from "utils/use-http";

// 发送异步请求
export const useProjects = (param?: Partial<Project>) => {
  const client = useHttp();
  const { run, ...result } = useAsync<Project[]>();
  const data = cleanObject(param || {});
  useEffect(() => {
    run(client("projects", { data }));
  }, [param]);

  return result;
};
