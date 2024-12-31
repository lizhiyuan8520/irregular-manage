import request from "@/utils/request";

export const getTcList = (data) => {
    return request({
        url: "/intra/sl/irrigationgroup/list",
        method: "get",
        params: data,
    });
};
export const delTc = (data) => {
    return request({
        url: "/intra/sl/irrigationgroup/delete",
        method: "delete",
        data,
    });
};
export const getTcDetailById = (id) => {
    return request({
        url: `/intra/sl/irrigationgroup/detail/${id}`,
        method: "get",
    });
};
export const saveTc = (data) => {
    return request({
        url: `/intra/sl/irrigationgroup/submit`,
        method: "post",
        data,
    });
};