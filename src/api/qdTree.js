import request from "@/utils/request";

// 获取渠道tree
export const getQdTree = () => {
    return request({
        url: "/intra/monitor/monitorchannel/listTreeAll",
        method: "get",
    });
};
export const getQdList = (data) => {
    return request({
        url: "/intra/monitor/monitorchannel/list",
        method: "get",
        params: data,
    });
};
//删除节点
export const delNode = (data) => {
    return request({
        url: "/intra/monitor/monitorchannel/delete",
        method: "delete",
        data,
    });
};

// 保存或编辑节点
export const saveNode = (data) => {
    return request({
        url: "/intra/monitor/monitorchannel/submit",
        method: "post",
        data,
    });
};