import request from "@/utils/request";

export const getLcsList = (data) => {
    return request({
        url: "/intra/monitor/monitorflowing/list",
        method: "get",
        params: data,
    });
};
export const delLcs = (data) => {
    return request({
        url: "/intra/monitor/monitorflowing/delete",
        method: "delete",
        data,
    });
};
export const getLcsDetailById = (id) => {
    return request({
        url: `/intra/monitor/monitorflowing/detail/${id}`,
        method: "get",
        params: data,
    });
};
export const saveLcs = (data) => {
    return request({
        url: `/intra/monitor/monitorflowing/submit`,
        method: "post",
        data,
    });
};