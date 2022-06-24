<template>
  <div>
    <h3>roles角色列表</h3>
    <!-- 面包导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: 'welcom' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="0.1">
          <el-button type="primary" @click="dialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="rolesList" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template v-slot="scope" width="100%">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag
                  :class="['marLeft']"
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                >
                  {{ item1.authName }}
                </el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级三级权限 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >
                      {{ item2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      size="medium"
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>
              {{ scope.row }}
            </pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"> </el-table-column>
        <el-table-column prop="roleName" label="角色名称"> </el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"> </el-table-column>
        <el-table-column label="操作" v-slot="scope">
          <el-button
            size="small"
            type="primary"
            icon="el-icon-edit"
            @click="showEdietDialog(scope.row.id)"
            >编辑</el-button
          >
          <el-button
            size="small"
            type="danger"
            icon="el-icon-delete"
            @click="removeRoleById(scope.row.id)"
            >删除</el-button
          >
          <el-button
            size="small"
            type="warning"
            icon="el-icon-setting"
            @click="showSetRightDialog(scope.row)"
            >分配权限</el-button
          >
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加权限"
      :visible.sync="dialogVisible"
      width="30%"
      @closed="addRolesClosed"
    >
      <el-form
        ref="addRolesRef"
        :model="addRoles"
        :rules="ERolesRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesF"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色对话框 -->
    <el-dialog
      title="编辑角色"
      :visible.sync="EDialogVisible"
      width="30%"
      @closed="ERolesClosed"
    >
      <el-form
        ref="ERolesRef"
        :model="ERoles"
        :rules="ERolesRules"
        label-width="80px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="ERoles.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="ERoles.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="EDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="ERolesF"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
        :class="['marLeft']"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      dialogVisible: false,
      addRoles: {
        roleName: "adrole",
        roleDesc: "adroleDesc",
      },
      ERolesRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      // 编辑
      ERoles: [],
      EDialogVisible: false,
      //分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      rightsList: [],
      treeProps: {
        label: "authName",
        children: "children",
      },
      defKeys: [105],
      roleId: "",
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取整个页面信息-角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.rolesList = res.data;
      console.log(this.rolesList);
      this.$message.success(res.meta.msg);
    },
    // 添加角色
    async addRolesF() {
      this.$refs.addRolesRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.post("roles", this.addRoles);
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getRolesList();
        this.dialogVisible = false;
      });
    },
    // 表格关闭事件——重置表单内容
    addRolesClosed() {
      this.$refs.addRolesRef.resetFields();
    },
    ERolesClosed() {
      this.$refs.ERolesRef.resetFields();
    },
    //点击编辑按钮后——获取数据——渲染到对话框
    async showEdietDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.ERoles = res.data;
      this.EDialogVisible = true;
      console.log(ERoles);
      this.$message.success(res.meta.msg);
    },
    //点击对话框——确定按钮——提交编辑过后内容
    async ERolesF() {
      this.$refs.ERolesRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "roles/" + this.ERoles.roleId,
          this.ERoles
        );
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.EDialogVisible = false;
        this.getRolesList();
        this.$message.success("编辑内容已更新");
      });
    },
    // 删除按钮
    async removeRoleById(id) {
      // 询问用户是否删除数据
      const confirmrResult = await this.$confirm(
        "此操作将删除该角色?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });
      console.log(confirmrResult);
      if (confirmrResult !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败!");
      }
      this.$message.success("删除成功！");
      this.getRolesList();
    },
    // 展开域内-Tag——删除按钮
    async removeRightById(role, rightId) {
      const confirmrResult1 = await this.$confirm(
        "此操作将删除该角色?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).catch((err) => {
        return err;
      });
      if (confirmrResult1 !== "confirm") {
        return this.$message.info("已取消删除");
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败!");
      }
      this.$message.success("删除权限成功！");
      role.children = res.data;
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      this.roleId = role.id;
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.rightsList = res.data;
      console.log(this.rightsList);
      this.getLeafKeys(role, this.defKeys);
      this.setRightDialogVisible = true;
    },
    //递归。获取角色下所有三级权限的id，保存到defKey数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 关闭对话框清空——缓存的——勾选框
    setRightDialogClosed() {
      this.defKeys = [];
    },
    async submitRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ];
      console.log(keys);
      const idStr = keys.join(",");
      console.log(idStr);
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getRolesList();
      this.setRightDialogVisible = false;
    },
  },
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.marLeft {
  margin-left: 50px !important;
  background-color: #fff;
}
</style>
