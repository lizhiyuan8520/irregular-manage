<template>
  <div>
    <!-- 查询输入框和按钮 -->
    <el-form :inline="true" :model="searchForm" class="form-inline">
      <el-form-item>
        <el-input v-model="searchForm.name" placeholder="点位分组名称"></el-input>
      </el-form-item>
      <el-button type="primary" @click="fetchData">搜索</el-button>
      <el-button @click="resetForm">重置</el-button>
      <el-button type="success" @click="openDialog()">新增点位分组</el-button>
    </el-form>

    <!-- 列表和分页 -->
    <el-table :data="pointGroups" style="width: 100%" border>
      <el-table-column prop="groupId" label="序号" width="80"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="latitude" label="纬度"></el-table-column>
      <el-table-column prop="longitude" label="经度"></el-table-column>
      <el-table-column prop="state" label="状态" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.state === 1 ? 'success' : 'info'">
            {{ scope.row.state === 1 ? '在线' : '离线' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="primary" size="small" @click="openDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="deletePointGroup(scope.row.groupId)">删除</el-button>
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

    <!-- 弹框 -->
    <el-dialog :title="isEdit ? '编辑点位分组' : '新增点位分组'" v-model="dialogVisible">
      <el-form :model="pointGroupForm" ref="pointGroupForm" label-width="100px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="pointGroupForm.name" placeholder="请输入名称"></el-input>
        </el-form-item>
        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="pointGroupForm.latitude" placeholder="请输入纬度"></el-input>
        </el-form-item>
        <el-form-item label="经度" prop="longitude">
          <el-input v-model="pointGroupForm.longitude" placeholder="请输入经度"></el-input>
        </el-form-item>
        <el-form-item label="图片地址" prop="snapshot">
          <el-input v-model="pointGroupForm.snapshot" placeholder="请输入图片地址"></el-input>
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
import { ref, reactive, onMounted } from 'vue';
import { addPointGroup, delPointGroup, getPointGroup } from '@/api/pointGroup'; // 根据实际路径修改

const searchForm = reactive({
  name: ''
});

const pointGroups = ref([]);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

const dialogVisible = ref(false);
const isEdit = ref(false);
const pointGroupForm = reactive({
  groupId: null,
  name: '',
  latitude: '',
  longitude: '',
  snapshot: ''
});

const fetchData = async (page = 1) => {
  const params = { name: searchForm.name, curPage: page, pageSize: pagination.pageSize };
  const res = await getPointGroup(params);
  if (res) {
    pointGroups.value = res.list;
    pagination.total = res.totalCount;
    pagination.currentPage = res.curPage;
  }
};

const openDialog = (row) => {
  if (row) {
    isEdit.value = true;
    Object.assign(pointGroupForm, row);
  } else {
    isEdit.value = false;
    Object.assign(pointGroupForm, {
      groupId: null,
      name: '',
      latitude: '',
      longitude: '',
      snapshot: ''
    });
  }
  dialogVisible.value = true;
};

const handleSubmit = async () => {
  await addPointGroup(pointGroupForm);
  dialogVisible.value = false;
  fetchData();
};

const deletePointGroup = async (id) => {
  await delPointGroup({ ids: [id] });
  fetchData();
};

const resetForm = () => {
  searchForm.name = '';
  fetchData();
};

onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.form-inline {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.dialog-footer {
  text-align: right;
}
</style>
