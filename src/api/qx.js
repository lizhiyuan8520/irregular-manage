import request from "@/utils/request";

export const getQxList = (data) => {
    return request({
        url: "/intra/monitor/monitorweather/list",
        method: "get",
        params: data,
    });
};
export const delQx = (data) => {
    return request({
        url: "/intra/monitor/monitorweather/delete",
        method: "delete",
        data,
    });
};
export const getQxDetailById = (id) => {
    return request({
        url: `/intra/monitor/monitorweather/detail/${id}`,
        method: "get",
        params: data,
    });
};
export const saveQx = (data) => {
    return request({
        url: `/intra/monitor/monitorweather/submit`,
        method: "post",
        data,
    });
};