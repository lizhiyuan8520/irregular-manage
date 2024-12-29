<template>
  <div class="container">
    <div class="searchArea">
      <!-- 查询输入框和按钮 -->
      <el-form :inline="true" :model="searchForm" class="form-inline">
        <el-form-item label="设备名称">
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
        <el-button type="success" @click="openDialog">新增</el-button>
      </div>
      <!-- 列表和分页 -->
      <el-table
        :data="tableData"
        style="width: 100%; margin-top: 10px; height: 700px"
        border
      >
        <el-table-column label="序号" type="index" width="80" />
        <el-table-column prop="name" label="设备名称" />
        <el-table-column prop="factoryName" label="设备厂家" />
        <el-table-column prop="address" label="设备地址" />
        <el-table-column prop="material" label="设备材料" />
        <el-table-column prop="deptName" label="行政" />
        <el-table-column prop="channelName" label="渠道" />
        <el-table-column prop="state" label="设备状态">
          <template #default="scope">
            {{ scope.row.state == 0 ? "异常" : "正常" }}
          </template>
        </el-table-column>
        <el-table-column prop="zhNo" label="桩号"> </el-table-column>
        <el-table-column prop="snapshot" label="设备照片">
          <template #default="scope">
            <el-image
              style="width: 30px; height: 30px"
              :preview-src-list="[scope.row.snapshot]"
              :src="scope.row.snapshot"
              fit="fill"
            >
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click="openDialog(scope.row)"
              >编辑</el-button
            >
            <el-popconfirm
              title="确定删除此设备吗?"
              @confirm="deletePointGroup(scope.row.id)"
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
      :title="deviceForm.id ? '编辑设备' : '新增设备'"
      v-model="dialogVisible"
      append-to-body
      destroy-on-close
      width="500px"
    >
      <el-form
        :model="deviceForm"
        append-to-body
        destroy-on-close
        label-width="100px"
      >
        <el-form-item
          label="设备名称"
          prop="name"
          :rules="[
            { required: true, message: '请输入设备名称', trigger: 'blur' },
          ]"
        >
          <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
        </el-form-item>
        <el-form-item label="设备材料" prop="material">
          <el-input
            v-model="deviceForm.material"
            placeholder="请输入设备材料"
          />
        </el-form-item>
        <el-form-item label="桩号" prop="zhNo">
          <el-input v-model="deviceForm.zhNo" placeholder="请输入桩号" />
        </el-form-item>
        <el-form-item label="渠道" prop="channelId">
          <el-tree-select
            v-model="deviceForm.channelId"
            :data="qdTree"
            filterable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="行政" prop="deptId">
          <el-tree-select
            v-model="deviceForm.deptId"
            :data="deptTree"
            filterable
            style="width: 240px"
          />
        </el-form-item>
        <el-form-item label="设备厂商" prop="factoryId">
          <el-select v-model="deviceForm.factoryId">
            <el-option
              v-for="item in deviceFactoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备照片" prop="snapshot">
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
              v-if="deviceForm.snapshot"
              :src="deviceForm.snapshot"
              class="avatar"
            />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
            <template #tip>
              <div style="font-size: 12px; color: #999">
                仅支持 JPG/PNG 格式，大小不超过 500KB。<br />
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
import { saveLcs, getLcsDetailById, delLcs, getLcsList } from "@/api/lcs"; // 根据实际路径修改
import { Delete, Edit, Search, Share, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { listDept } from "@/api/system/dept";
import { getQdTree } from "@/api/qdTree";
import { getToken } from "@/utils/auth";
import { getDeviceFactoryList } from "@/api/deviceFactory";
const searchForm = reactive({
  name: "",
});
const deviceFactoryList = ref([]);
const deptTree = ref([]);
const qdTree = ref([]);
getDeviceFactoryList({
  curPage: 1,
  pageSize: 100,
}).then((res) => {
  deviceFactoryList.value = res.data.list;
});
listDept().then((res) => {
  deptTree.value = transformToTree(res.data);
});
getQdTree().then((res) => {
  qdTree.value = transformData(res.data);
});
const tableData = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const dialogVisible = ref(false);
const deviceForm = reactive({
  name: "",
  factoryId: null,
  irriId: 1000,
  deptId: null, //行政
  channelId: null, //渠道
  address: "",
  material: "",
  snapshot: "",
  zhNo: "",
});
function transformData(data) {
  return data.map((item) => ({
    value: item.id, // deptId -> value
    label: item.name, // deptName -> label
    children: item.childList ? transformData(item.childList) : [], // 递归处理子节点
  }));
}
function transformToTree(data) {
  // 创建一个以 deptId 为键的映射表
  const map = new Map();

  // 存储最终的树形结构
  const tree = [];

  // 初始化 map，每个节点以 deptId 作为键，便于快速查找
  data.forEach((item) => {
    map.set(item.deptId, {
      label: item.deptName,
      value: item.deptId,
      children: [],
    });
  });

  // 构建树形结构
  data.forEach((item) => {
    const node = map.get(item.deptId);

    // 如果该节点有 parentId，说明它不是根节点，应该加入到其父节点的 children 中
    if (item.parentId !== 0) {
      const parentNode = map.get(item.parentId);
      parentNode.children.push(node);
    } else {
      // 否则，它是根节点，直接加入到树的根节点数组中
      tree.push(node);
    }
  });

  return tree;
}
const handleAvatarSuccess = (res, uploadFile) => {
  ElMessage({
    message: "上传成功！",
    type: "success",
  });
  deviceForm.snapshot = res.data.fileUrl || res.data.link || res.data.url;
};
const fetchData = () => {
  const params = {
    name: searchForm.name,
    curPage: pagination.currentPage,
    pageSize: pagination.pageSize,
  };
  getLcsList(params).then((res) => {
    tableData.value = res.data.list;
    pagination.total = res.data.totalCount;
    pagination.currentPage = res.data.curPage;
  });
};

const openDialog = (row) => {
  dialogVisible.value = true;
  if (row.id) {
    getLcsDetailById(row.id).then((res) => {
      Object.assign(deviceForm, res.data);
    });
  } else {
    Object.assign(deviceForm, {
      name: "",
      factoryId: null,
      irriId: 1000,
      deptId: null, //行政
      channelId: null, //渠道
      address: "",
      material: "",
      snapshot: "",
      zhNo: "",
    });
  }
};
const beforeAvatarUpload = (file) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  const isLt200k = file.size / 1024 < 500;

  if (!isJpgOrPng) {
    ElMessage.error("上传图片格式应为 JPG 或 PNG!");
  }
  if (!isLt200k) {
    ElMessage.error("上传图片大小不能超过 200KB!");
  }
  return isJpgOrPng && isLt200k;
};
const handleSubmit = () => {
  saveLcs(deviceForm).then((res) => {
    ElMessage.success("新增成功！");
    dialogVisible.value = false;
    fetchData();
  });
};

const deletePointGroup = async (id) => {
  delLcs([id]).then((res) => {
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
