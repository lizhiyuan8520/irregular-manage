import request from "@/utils/request";

export const getBzList = (data) => {
  return request({
    url: "/intra/monitor/monitorpump/list",
    method: "get",
    params: data,
  });
};
export const delBz = (data) => {
  return request({
    url: "/intra/monitor/monitorpump/delete",
    method: "delete",
    data,
  });
};
export const getBzDetailById = (id) => {
  return request({
    url: `/intra/monitor/monitorpump/detail/${id}`,
    method: "get",
    params: data,
  });
};
export const saveBz = (data) => {
  return request({
    url: `/intra/monitor/monitorpump/submit`,
    method: "post",
    data,
  });
};
