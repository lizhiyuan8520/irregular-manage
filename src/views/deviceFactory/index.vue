<template>
  <div class="container">
    <div class="searchArea">
      <!-- 查询输入框和按钮 -->
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="厂家名称">
          <el-input v-model="searchForm.name" placeholder="请输入"></el-input>
        </el-form-item>
        <el-button type="primary" :icon="Search" @click="fetchData"
          >搜索</el-button
        >
        <el-button @click="resetForm">重置</el-button>
      </el-form>
    </div>
    <div class="listArea">
      <div class="btuArea">
        <el-button type="success" @click="openDialog()">新增</el-button>
      </div>
      <!-- 列表和分页 -->
      <el-table
        :data="tableData"
        style="width: 100%; margin-top: 10px; height: 700px"
        border
      >
        <el-table-column label="序号" type="index" width="80" />
        <el-table-column prop="name" label="设备工厂名称"></el-table-column>
        <el-table-column prop="创建时间" label="创建时间"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openDialog(scope.row)"
              >编辑</el-button
            >
            <el-popconfirm
              title="确定删除吗?"
              @confirm="handelDelete(scope.row.id)"
            >
              <template #reference>
                <el-button type="danger" size="small">删除</el-button>
              </template>
            </el-popconfirm>
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
      :title="isEdit ? '编辑设备厂家' : '新增设备厂家'"
      v-model="dialogVisible"
      append-to-body
      destroy-on-close
      width="500px"
    >
      <el-form
        :model="form"
        append-to-body
        destroy-on-close
        label-width="100px"
      >
        <el-form-item
          label="设备厂商"
          prop="name"
          :rules="[
            { required: true, message: '请输入设备厂商名称', trigger: 'blur' },
          ]"
        >
          <el-input v-model="form.name" placeholder="请输入名称" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            :rows="3"
            type="textarea"
            v-model="form.remark"
            placeholder="请输入备注"
          />
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
import {
  editDeviceFactory,
  delDeviceFactory,
  getDeviceFactoryList,
} from "@/api/deviceFactory"; // 根据实际路径修改
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getToken } from "@/utils/auth";
const searchForm = reactive({
  name: "",
});

const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);
const dialogVisible1 = ref(false);
const isEdit = ref(false);
const form = reactive({
  name: "",
  remark: "",
});
const handleAvatarSuccess = (res, uploadFile) => {
  ElMessage({
    message: "上传成功！",
    type: "success",
  });
  form.snapshot = res.data.fileUrl || res.data.link || res.data.url;
};
const fetchData = async (page = 1) => {
  const params = {
    name: searchForm.name,
    curPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  };
  getDeviceFactoryList(params).then((res) => {
    tableData.value = res.data.list;
    pagination.total = res.data.totalCount;
    pagination.currentPage = res.data.curPage;
  });
};

const openDialog = (row) => {
  dialogVisible.value = true;
  if (row) {
    isEdit.value = true;
    Object.assign(form, row);
  } else {
    isEdit.value = false;
    Object.assign(form, {
      name: "",
      remark: "",
    });
  }
};
const handleSubmit = async () => {
  editDeviceFactory(form).then((res) => {
    ElMessage.success("新增成功！");
  });
  dialogVisible.value = false;
  fetchData();
};

const handelDelete = async (id) => {
  delDeviceFactory([id]).then((res) => {
    if (res) ElMessage.success("删除成功!");
    fetchData();
  });
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
.avatar {
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
.container {
  width: 100%;
  height: 100%;
  .searchArea {
    position: relative;
    width: 100%;
    height: 80px;
    padding-top: 30px;
    padding-left: 50px;
    border-bottom: 1px solid #d2d2d2;
  }
  .listArea {
    position: relative;
    height: calc(100% - 80px);
    width: 100%;
    padding: 10px;
    .btuArea {
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
