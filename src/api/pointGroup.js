import request from '@/utils/request'
// 新增或更新点位分组
//入参 
// {
//     "createAt": "",
//     "groupId": 0,
//     "irriId": 0,
//     "latitude": "",
//     "longitude": "",
//     "name": "",
//     "remark": "",
//     "snapshot": "",
//     "state": 0,
//     "updateAt": ""
//   }
//出参 boolean
export const addPointGroup = (data) => {
    return request({
        url: '/sl-api/api/sl/irrigationgrouppoint/submit',
        method: 'post',
        data
    })
}
// 删除点位分组
//入参 ids
//出参 boolean
export const delPointGroup = (data) => {
    return request({
        url: '/sl-api/api/sl/irrigationgrouppoint/submit',
        method: 'delete',
        data
    })
}
// 获取点位分组
//入参 name
//返回实例
// {
// 	"curPage": 0,
// 	"list": [],
// 	"pageSize": 0,
// 	"totalCount": 0,
// 	"totalPage": 0
// }
export const getPointGroup = (data) => {
    return request({
        url: '/sl-api/api/sl/irrigationgrouppoint/browse',
        method: 'get',
        data
    })
}
// 获取点位分组详情
export const getPointGroupById = (id) => {
    return request({
        url: `/sl-api/api/sl/irrigationgrouppoint/detail/${id}`,
        method: 'get'
    })
}