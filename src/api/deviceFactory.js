import request from "@/utils/request";

export const getDeviceFactoryList = (data) => {
  return request({
    url: "/intra/monitor/monitorfactory/list",
    method: "get",
    params: data,
  });
};
export const editDeviceFactory = (data) => {
  return request({
    url: "/intra/monitor/monitorfactory/submit",
    method: "post",
    params: data,
  });
};
export const delDeviceFactory = (data) => {
  return request({
    url: "/intra/monitor/monitorfactory/delete",
    method: "delete",
    data,
  });
};
