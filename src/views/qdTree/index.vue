<template>
  <div class="app-container">
    <el-form
      :model="queryParams"
      ref="queryRef"
      :inline="true"
      v-show="showSearch"
    >
      <el-form-item label="渠道名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入渠道名称"
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
      <el-table-column prop="name" label="节点名称"></el-table-column>
      <el-table-column prop="remark" label="备注"></el-table-column>
      <el-table-column
        label="创建时间"
        align="center"
        prop="createAt"
        width="300"
      >
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

    <!-- 添加或修改渠道对话框 -->
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
            <el-form-item label="渠道名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入渠道名称" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="备注">
              <el-input
                :rows="3"
                type="textarea"
                v-model="form.remark"
                placeholder="请输入备注"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="state" label="渠道状态" width="100">
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
import { ref, onMounted } from "vue";
import { getQdTree, delNode, saveNode, getQdList } from "@/api/qdTree"; // 引入接口
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
    name: [{ required: true, message: "渠道名称不能为空", trigger: "blur" }],
  },
});

const { queryParams, rules } = toRefs(data);
const form = reactive({});

/** 查询渠道列表 */
function getList() {
  loading.value = true;
  getQdList({ curPage: 1, pageSize: 100, ...queryParams.value }).then(
    (response) => {
      tableData.value = proxy.handleTree(
        response.data.list,
        "id",
        "parentId",
        "childList"
      );
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
    remark: "",
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
  title.value = "添加渠道";
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
  title.value = "修改渠道";
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["deptRef"].validate((valid) => {
    if (valid) {
      if (form.id) {
        saveNode(form).then((response) => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        saveNode(form).then((response) => {
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
      delNode([row.id]).then((res) => {
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
