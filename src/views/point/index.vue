<template>
  <div class="container">
    <div class="searchArea">
          <!-- 查询输入框和按钮 -->
    <el-form :inline="true" :model="searchForm" class="form-inline">
      <el-form-item label="点位名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-form-item label="点位分组">
        <el-select
          v-model="searchForm.groupId"
          placeholder="请输入"
          style="width:200px"
        >
        <el-option       
        v-for="item in pointGroupList"
        :key="item.id"
        :label="item.name"
        :value="item.id"></el-option></el-select>
      </el-form-item>
      <el-button type="primary" :icon="Search"  @click="fetchData">搜索</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form>

  
    </div>
<div class="listArea">
    <div class="btuArea">   <el-button type="success"  @click="openDialog()">新增</el-button></div>
    <!-- 列表和分页 -->
    <el-table :data="pointList" style="width: 100%;margin-top:10px;height:700px" border>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="longitude" label="经度"></el-table-column>
      <el-table-column prop="latitude" label="维度"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="groupId" label="所属组">
               <template #default="scope">
                {{getGroupLabel(scope.row.groupId)}}
        </template>
      </el-table-column>
      <el-table-column prop="state" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.state === 1 ? 'success' : 'info'">
            {{ scope.row.state === 1 ? "启用" : "未启用" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openDialog(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="small"
            @click="deletePoint(scope.row.pointId)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      style="float:right"
      @current-change="fetchData"
      :current-page="pagination.currentPage"
      :page-size="pagination.pageSize"
      layout="total, prev, pager, next"
      :total="pagination.total"
    />
</div>

    <!-- 弹框 -->
    <el-dialog
      :title="isEdit ? '编辑点位分组' : '新增点位分组'"
      v-model="dialogVisible"
      append-to-body 
      destroy-on-close
      width="500px"
    >

      <el-form  :model="pointForm" ref="form" append-to-body destroy-on-close  label-width="100px">
        <el-form-item label="名称" prop="name" :rules="[ { required: true, message: '请输入名称', trigger: 'blur' }]">
        <el-input
            v-model="pointForm.name"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="经度" prop="longitude" :rules="[ { required: true, message: '请输入经度', trigger: 'blur' }]">
        <el-input
            v-model="pointForm.longitude"
            placeholder="请输入经度"
          />
        </el-form-item>
        <el-form-item label="纬度" prop="latitude" :rules="[ { required: true, message: '请输入纬度', trigger: 'blur' }]">
        <el-input
            v-model="pointForm.latitude"
            placeholder="请输入纬度"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
           <el-input
            :rows="3"
            type="textarea"
            v-model="pointForm.remark"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="点位分组" prop="groupId" :rules="[ { required: true, message: '点位分组必选', trigger: 'blur' }]">
                <el-select
          v-model="pointForm.groupId"
          placeholder="请选中组别"
           style="width:200px"
        >
        <el-option       
        v-for="item in pointGroupList"
        :key="item.id"
        :label="item.name"
        :value="item.id"></el-option></el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { addPoint, delPoint, getPoint,getPointGroup} from "@/api/pointGroup"; // 根据实际路径修改
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const searchForm = reactive({
  name: "",
  groupId:""
});
const form=ref()
const pointList=ref([])
const pointGroupList=ref([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const getGroupLabel=(groupId)=>{
    if(groupId)
    return pointGroupList.value.filter(f=>f.id==groupId)[0].name
    else return ''
}
const dialogVisible = ref(false);
const isEdit = ref(false);
const pointForm = reactive({
  name: "",
  remark:"",
  latitude: "",
  longitude: "",
  groupId:"",
  irriId:1000
});
const fetchData = (page = 1) => {
  const params = {
    name: searchForm.name,
    curPage: pagination.currentPage,
    pageSize: pagination.pageSize,
    groupId:searchForm.groupId
  };
  getPoint(params).then(res=>{
    pointList.value = res.data.list;
    pagination.total = res.data.totalCount;
    pagination.currentPage = res.data.curPage;
  })

};

const openDialog = (row) => {
    dialogVisible.value = true;
  if (row) {
    isEdit.value = true;
    Object.assign(pointForm, row);

  } else {
    isEdit.value = false;
    Object.assign(pointForm, {
        name: "",
        remark:"",
        latitude: "",
        longitude: "",
        groupId:"",
        irriId:1000
    });

  }

};

const handleSubmit = () => {
    form.value.validate((valid, fields) =>{
          if (valid) {
        addPoint(pointForm).then((res) => {
            ElMessage.success("新增成功！")
            dialogVisible.value = false;
            fetchData();
            } );
            } 
    else {
      console.log('error submit!', fields)
    }
    })
};

const deletePoint = (id) => {
   delPoint([id]).then(res=>{
    if(res)
    ElMessage.success('删除成功!')
    fetchData();
   })

};

const resetForm = () => {
  searchForm.name = "";
  searchForm.groupId = "";
  fetchData();
};

onMounted(() => {
  fetchData();
  getPointGroup({curPage:1,pageSize:100}).then(res=>{
    pointGroupList.value=res.data.list
  })
});
</script>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.avatar{
    width: 100px;
  height: 100px;
   display: block;
}
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

 :deep(.el-icon.avatar-uploader-icon) {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
}
.container{
  width: 100%;
  height: 100%;
  .searchArea{
    position: relative;
    width: 100%;
    height: 80px;
    padding-top:30px;
    padding-left:50px;
    border-bottom: 1px solid #d2d2d2;

  }
  .listArea{
    position: relative;
    height: calc(100% - 80px);
    width: 100%;
    padding:10px 0px;
        .btuArea{
      width: 100%;
      height: 30px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }
  }
}
.form-inline {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.dialog-footer {
  text-align: right;
}
</style>
