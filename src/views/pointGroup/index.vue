<template>
  <div class="container">
    <div class="searchArea">
          <!-- 查询输入框和按钮 -->
    <el-form :inline="true" :model="searchForm" class="form-inline">
      <el-form-item label="点位数组名称">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入"
        ></el-input>
      </el-form-item>
      <el-button type="primary" :icon="Search"  @click="fetchData">搜索</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form>

  
    </div>
<div class="listArea">
    <div class="btuArea">   <el-button type="success"  @click="openDialog()">新增</el-button></div>
    <!-- 列表和分页 -->
    <el-table :data="pointGroups" style="width: 100%;margin-top:10px;height:700px" border>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column prop="snapshot" label="图标">
               <template #default="scope">
          <el-image style="width: 30px; height: 30px"   :preview-src-list="[scope.row.snapshot]" :src="scope.row.snapshot" fit="fill">
          </el-image>
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
            @click="deletePointGroup(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
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

      <el-form  :model="pointGroupForm" append-to-body destroy-on-close  label-width="100px">
        <el-form-item label="名称" prop="name" :rules="[ { required: true, message: '请输入名称', trigger: 'blur' }]">
        <el-input
            v-model="pointGroupForm.name"
            placeholder="请输入名称"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
           <el-input
            :rows="3"
            type="textarea"
            v-model="pointGroupForm.remark"
            placeholder="请输入备注"
          />
        </el-form-item>
        <el-form-item label="点位图标" prop="snapshot">
          <el-upload
          class="avatar-uploader"
          action="/dev-api/sl-api/stage/oss/upload"
          :show-file-list="false"
          :headers="{
            'X-Noodle-Token':getToken()
          }"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
           <img  v-if="pointGroupForm.snapshot"  :src="pointGroupForm.snapshot" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          <template #tip>
          <div style="font-size: 12px; color: #999;">
            仅支持 JPG/PNG 格式，大小不超过 200KB。<br>
            如未上传则使用默认点代替。
          </div>
        </template>
        </el-upload>
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
import { addPointGroup, delPointGroup, getPointGroup } from "@/api/pointGroup"; // 根据实际路径修改
import { Delete, Edit, Search, Share, Upload } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
const searchForm = reactive({
  name: "",
});

const pointGroups = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);
const dialogVisible1 = ref(false);
const isEdit = ref(false);
const pointGroupForm = reactive({
  name: "",
  remark:"",
  snapshot: "",
  irriId:1000
});
const form = reactive({ name: '', remark: '', image: '', coordinates: null });
const handleAvatarSuccess=(res,uploadFile)=>{
  ElMessage({
    message: '上传成功！',
    type: 'success',
  })
 pointGroupForm.snapshot=res.data.filePath||res.data.fileUrl||res.data.link||res.data.url
}
const fetchData = async (page = 1) => {
  const params = {
    name: searchForm.name,
    curPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  };
  getPointGroup(params).then(res=>{
    pointGroups.value = res.data.list;
    pagination.total = res.data.totalCount;
    pagination.currentPage = res.data.curPage;
  })

};

const openDialog = (row) => {
    dialogVisible.value = true;
  if (row) {
    isEdit.value = true;
    Object.assign(pointGroupForm, row);

  } else {
    isEdit.value = false;
    Object.assign(pointGroupForm, {
      groupId: null,
      name: "",
      latitude: "",
      longitude: "",
      snapshot: "",
      irriId: 1000,
    });

  }

};
const beforeAvatarUpload=(file)=>{
   const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  const isLt200k = file.size / 1024 < 200;

  if (!isJpgOrPng) {
    ElMessage.error('上传图片格式应为 JPG 或 PNG!');
  }
  if (!isLt200k) {
    ElMessage.error('上传图片大小不能超过 200KB!');
  }
  return isJpgOrPng && isLt200k;
}
const handleSubmit = async () => {
  addPointGroup(pointGroupForm).then((res) => {
    ElMessage.success("新增成功！")
  });
  dialogVisible.value = false;
  fetchData();
};

const deletePointGroup = async (id) => {
   delPointGroup([id]).then(res=>{
    if(res)
    ElMessage.success('删除成功!')
    fetchData();
   })

};

const resetForm = () => {
  searchForm.name = "";
  fetchData();
};

onMounted(() => {
  fetchData();
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
    padding:10px;
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
