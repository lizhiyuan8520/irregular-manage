import request from "@/utils/request";

export const getLcsList = (data) => {
    return request({
        url: "/intra/monitor/monitorflowing/list",
        method: "get",
        params: data,
    });
};