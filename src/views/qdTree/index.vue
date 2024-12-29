<template>
  <div style="padding: 20px">
    <div>
      <el-button type="primary" @click="handleAdd">添加节点</el-button>
      <el-button type="danger" @click="handleDelete" :disabled="!selectedNode"
        >删除节点</el-button
      >
      <el-button type="info" @click="handleEdit" :disabled="!selectedNode"
        >编辑节点</el-button
      >
      <!-- <el-button type="success" @click="handleSave">保存树形结构</el-button> -->
    </div>
    <el-tree
      :data="treeData"
      default-expand-all
      :props="defaultProps"
      node-key="id"
      @node-click="handleNodeClick"
      style="margin-top: 20px"
    ></el-tree>

    <el-dialog
      title="编辑节点"
      v-model="dialogVisible"
      destroy-on-close
      style="width: 300px"
    >
      <el-form :model="editForm">
        <el-form-item label="节点名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="handleSaveEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getQdTree, delNode, saveNode } from "@/api/qdTree"; // 引入接口
import { ElMessage } from "element-plus";

// 初始化树形数据
const treeData = ref([]); // 存储树形数据
const selectedNode = ref(null); // 当前选中的节点
const dialogVisible = ref(false); // 编辑弹框是否可见

// 树形数据属性配置
const defaultProps = {
  children: "childList",
  label: "name",
};

// 组件挂载后获取树形数据
onMounted(async () => {
  try {
    getTree();
  } catch (error) {
    ElMessage.error("获取树形结构失败");
  }
});
const getTree = async () => {
  const response = await getQdTree(); // 调用接口获取数据
  treeData.value = response.data || [];
};
// 处理点击节点
const handleNodeClick = (node) => {
  console.log("cleckNode", node);
  selectedNode.value = node;
};
const editForm = ref({ name: "", remark: "" });
// 添加节点
const handleAdd = () => {
  let node = null;
  if (selectedNode.value) {
    node = {
      name: "新节点",
      parentId: selectedNode.value.id,
      state: 0,
      createAt: "",
      updateAt: "",
      remark: "",
      childList: [],
    };
  } else {
    node = {
      name: "根节点",
      parentId: null,
      state: 0,
      createAt: "",
      updateAt: "",
      remark: "",
      childList: [],
    };
  }
  saveNode(node).then((res) => {
    ElMessage.success("新增成功！");
    getTree();
  });
};

// 删除节点
const handleDelete = async () => {
  if (selectedNode.value.childList && selectedNode.value.childList.length > 0) {
    ElMessage.warning("当前节点有子节点，请先删除子节点！");
    return;
  }
  try {
    const response = await delNode([selectedNode.value.id]); // 调用删除接口
    if (response.code === 200) {
      ElMessage.success("节点删除成功！");
      selectedNode.value = null;
      getTree(); // 刷新树形结构
    } else {
      ElMessage.error("删除失败，请重试！");
    }
  } catch (error) {
    ElMessage.error("删除操作失败，请检查网络或联系管理员！");
  }
};

// 编辑节点
const handleEdit = () => {
  Object.assign(editForm.value, selectedNode.value);
  dialogVisible.value = true;
};

// 保存编辑内容
const handleSaveEdit = () => {
  saveNode({ ...editForm.value }).then((res) => {
    ElMessage.success("编辑成功");
    dialogVisible.value = false;
    selectedNode.value = null;
    getTree();
  });
};

// 保存整个树形结构
const handleSave = async () => {
  let params = { monitorChannel: treeData.value };
  console.log(params);
  try {
    const response = await saveQdTree(params); // 调用保存接口
    ElMessage.success("树形结构已保存");
    getTree();
  } catch (error) {
    ElMessage.error("保存失败");
  }
};

// 查找父节点
const findParentNode = (data, nodeId) => {
  for (const node of data) {
    if (node.childList.some((child) => child.id === nodeId)) {
      return node;
    }
    const parent = findParentNode(node.childList, nodeId);
    if (parent) {
      return parent;
    }
  }
  return null;
};
</script>
