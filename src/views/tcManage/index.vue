<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="图层名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入图层名称"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          >新增</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" plain icon="Sort" @click="toggleExpandAll"
          >展开/折叠</el-button
        >
      </el-col>
      <right-toolbar
        v-model:showSearch="showSearch"
        @queryTable="getList"
      ></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="tableData"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{ children: 'childList', hasChildren: 'hasChildren' }"
    >
      <el-table-column
        prop="name"
        label="分组名称"
        width="200"
      ></el-table-column>
      <el-table-column
        prop="pointNum"
        label="节点数量"
        width="200"
      ></el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          {{ scope.row.state == 1 ? "启用" : "禁用" }}
        </template>
      </el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createAt"
        width="300"
      >
      </el-table-column>
      <el-table-column
        label="分组图标"
        align="center"
        prop="groupIcon"
        width="200"
      >
        <template #default="scope">
          <el-image
            style="width: 30px; height: 30px"
            :preview-src-list="[scope.row.groupIcon]"
            :src="scope.row.groupIcon"
            fit="fill"
          >
          </el-image>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        class-name="small-padding fixed-width"
      >
        <template #default="scope">
          <el-button
            link
            type="primary"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            link
            type="primary"
            icon="Plus"
            @click="handleAdd(scope.row)"
            >新增</el-button
          >
          <el-button
            link
            type="primary"
            icon="Delete"
            @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加或修改图层对话框 -->
    <el-dialog
      :title="title"
      v-model="open"
      width="600px"
      append-to-body
      destroy-on-close
    >
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="24">
            <el-form-item label="分组名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入分组名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="分组图标" prop="groupIcon">
              <el-upload
                class="avatar-uploader"
                action="/dev-api/stage/oss/upload"
                :show-file-list="false"
                :headers="{
                  'X-Noodle-Token': getToken(),
                  Authorization: 'Bearer ' + getToken(),
                }"
                :on-success="handleAvatarSuccess"
                :before-upload="beforeAvatarUpload"
              >
                <img
                  v-if="form.groupIcon"
                  :src="form.groupIcon"
                  class="avatar"
                />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                <template #tip>
                  <div style="font-size: 12px; color: #999">
                    仅支持 JPG/PNG 格式，大小不超过 200KB。<br />
                    如未上传则使用默认点代替。
                  </div>
                </template>
              </el-upload>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="图层状态" prop="state">
              <el-switch
                v-model="form.state"
                :active-value="1"
                :inactive-value="0"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { getTcList, delTc, getTcDetailById, saveTc } from "@/api/tc";
import { getToken } from "@/utils/auth";
import { ElMessage, ElMessageBox } from "element-plus";
const { proxy } = getCurrentInstance();
const tableData = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(false);
const title = ref("");
const deptOptions = ref([]);
const isExpandAll = ref(true);
const refreshTable = ref(true);

const data = reactive({
  queryParams: {
    name: "",
  },
  rules: {
    name: [{ required: true, message: "分组名称不能为空", trigger: "blur" }],
  },
});

const { queryParams, rules } = toRefs(data);
const form = reactive({});
const handleAvatarSuccess = (res, uploadFile) => {
  ElMessage({
    message: "上传成功！",
    type: "success",
  });
  form.groupIcon = res.data.fileUrl || res.data.link || res.data.url;
  console.log("form.groupIcon", form.groupIcon);
};
const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  const isLt200k = file.size / 1024 < 200;

  if (!isJpgOrPng) {
    ElMessage.error("上传图片格式应为 JPG 或 PNG!");
  }
  if (!isLt200k) {
    ElMessage.error("上传图片大小不能超过 200KB!");
  }
  return isJpgOrPng && isLt200k;
};

/** 查询部门列表 */
function getList() {
  loading.value = true;
  getTcList({ curPage: 1, pageSize: 100, ...queryParams.value }).then(
    (response) => {
      tableData.value = proxy.handleTree(
        response.data.list,
        "id",
        "parentId",
        "childList"
      );
      console.log(tableData.value, response);
      loading.value = false;
    }
  );
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  Object.assign(form, {
    id: null,
    name: "",
    parentId: null,
    groupIcon: "",
    state: 1,
  });

  proxy.resetForm("deptRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  if (row != undefined) {
    form.parentId = row.id;
  } else {
    form.parentId = 0;
  }
  open.value = true;
  title.value = "添加图层";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
function handleUpdate(row) {
  Object.assign(form, row);
  open.value = true;
  title.value = "修改图层";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate((valid) => {
    if (valid) {
      if (form.id) {
        saveTc(form).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        saveTc(form).then((response) => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  ElMessageBox.confirm(
    '是否确认删除名称为"' + row.name + '"的数据项?',
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(() => {
      delTc([row.id]).then((res) => {
        getList();
        proxy.$modal.msgSuccess("删除成功");
      });
    })
    .catch(() => {
      ElMessage.info("取消删除");
    });
}
getList();
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
</style>
