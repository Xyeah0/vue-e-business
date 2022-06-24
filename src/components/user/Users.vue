<template>
  <div>
    <h3>用户列表</h3>
    <!-- 面包导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: 'welcom' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card class="box-card">
      <!-- 搜索+按钮 行 -->
      <el-row>
        <el-col :span="8" :gutter="20">
          <el-input
            clearable
            placeholder="请输入内容"
            v-model="queryInfo.query"
            class="input-with-select"
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="dialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" style="width: 100%" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名" width="180">
        </el-table-column>
        <el-table-column prop="email" label="邮箱" width="180">
        </el-table-column>
        <el-table-column prop="mobile" label="电话" width="180">
        </el-table-column>
        <el-table-column prop="role_name" label="角色" width="180">
        </el-table-column>
        <!-- 作用域插槽渲染状态开关 -->
        <el-table-column prop="mg_state" label="状态" width="180">
          <template v-slot="scope">
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChanged(scope.row)"
            >
            </el-switch>
          </template>
        </el-table-column>
        <!-- 作用域插槽渲染操作按钮 -->
        <el-table-column label="操作" width="180">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEdietDialog(scope.row.id)"
            ></el-button>

            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>

            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top-start"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoleF(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 对话框域 -->
    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="dialogVisible"
      width="30%"
      @closed="addUserClosed"
    >
      <el-form
        ref="addUserRef"
        :model="addUser"
        :rules="addUserRules"
        label-width="70px"
      >
        <el-form-item label="姓名" prop="username">
          <el-input v-model="addUser.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUser.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUser.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUser.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUserF"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @closed="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="addUserRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormInfo"> 确 定 </el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleVisible"
      width="30%"
      @closed="setRoleClosed"
    >
      <div>
        <p>当前用户：{{ userInfo.username }}</p>
        <p>当前角色：{{ userInfo.role_name }}</p>
        <span>分配新角色：</span>
        <el-select v-model="selectedRole" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          >
          </el-option>
        </el-select>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitSetRole"> 确 定 </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^[a-zA-Z0-9_\.]+@[a-zA-Z0-9-]+[\.a-zA-Z]+$/;
      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确格式的邮箱"));
    };
    var checkMobile = (rule, value, cb) => {
      const regMobile =
        /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入正确格式的手机号"));
    };
    return {
      // 获取用户列表——参数对象
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 2,
      },
      // 接收用户列表-容器
      userlist: [],
      // 用户列表-数据条数
      total: 0,
      // 对话框是否可见-属性
      dialogVisible: false,
      //编辑-对话框可见性
      addDialogVisible: false,
      // 表单绑定的对象
      addUser: {
        username: "aduser",
        password: "aduser",
        email: "aduser@aduser.com",
        mobile: "18797456576",
      },

      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户名长度应为 3 到 10 个字符",
            trigger: "blur",
          },
        ],
        password: [
          { required: true, message: "密码不能为空", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码长度应为 6 到 15位",
            trigger: "blur",
          },
        ],
        email: [
          { required: true, message: "邮箱不能为空", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" },
        ],
        mobile: [
          { required: true, message: "手机号不能为空", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" },
        ],
      },
      editForm: {},
      setRoleVisible: false,
      userInfo: {},
      rolesList: [],
      // 已选中下拉选项
      selectedRole: "",
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    // 获取用户列表
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo,
      });
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
    },
    // 监听分页数量——每页数量
    handleSizeChange(i) {
      this.queryInfo.pagesize = i;
      this.getUserList();
    },
    // 监听分页变化——当前页
    handleCurrentChange(j) {
      this.queryInfo.pagenum = j;
      this.getUserList();
    },
    // 监听用户状态改变
    async userStateChanged(x) {
      console.log(x);
      const { data: res } = await this.$http.put(
        `users/${x.id}/state/${x.mg_state}`
      );
      if (res.meta.status !== 200) {
        x.mg_state = !x.mg_state;
        return this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
    },
    addUserClosed() {
      this.$refs.addUserRef.resetFields();
    },
    addUserF() {
      this.$refs.addUserRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return;
        // 添加真正请求
        const { data: res } = await this.$http.post("users", this.addUser);
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.dialogVisible = false;
        this.getUserList();
      });
    },
    // 显示编辑按钮对话框
    async showEdietDialog(id) {
      console.log(id);
      this.addDialogVisible = true;
      const { data: res } = await this.$http.get("users/" + id);
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      // this.$message.success(res.meta.msg);
      this.editForm = res.data;
    },
    // 关闭对话框重置修改未提交的内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields;
    },
    // 编辑按钮-确定 ——按钮
    editFormInfo(id) {
      this.$refs.editFormRef.validate(async (valid) => {
        // console.log(valid);
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        );
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg);
        }
        this.addDialogVisible = false;
        this.$message.success(res.meta.msg);
        this.getUserList();
      });
    },
    // 删除按钮
    async removeUserById(id) {
      // 询问用户是否删除数据
      const confirmrResult = await this.$confirm(
        "此操作将删除该用户信息?",
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
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败!");
      }
      this.$message.success("删除成功！");
      this.getUserList();
    },
    //按下——分配角色——按钮
    async setRoleF(userInfo) {
      this.userInfo = userInfo;
      this.setRoleVisible = true;
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("获取成功！");
      this.rolesList = res.data;
    },
    // 分配角色
    async submitSetRole() {
      if (!this.selectedRole) {
        return this.$message.error("请选择要分配的角色！");
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        {
          rid: this.selectedRole,
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg);
      }
      this.$message.success("更新角色成功！");
      this.getUserList();
      this.setRoleVisible = false;
    },
    //关闭分配角色对话框
    setRoleClosed() {
      this.selectedRole = "";
      this.userInfo = {};
    },
  },
};
</script>

<style>
.marLeft {
  margin-left: 50px !important;
  background-color: pink;
}
</style>
