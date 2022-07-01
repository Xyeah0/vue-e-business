<template>
  <div>
    <h3>商品分类</h3>
    <!-- 面包导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: 'welcom' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区 -->
    <el-card>
      <!-- 按钮 -->
      <el-row>
        <el-col :span="0.1">
          <el-button type="primary" @click="showAddCateDialog"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: #41b883"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-if="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCateDialogShow(scope.row.cat_id)"
          >
            编辑
          </el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="deleCateDialogShow(scope.row.cat_id)"
          >
            删除
          </el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="this.queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateClosed"
    >
      <el-form
        ref="addCateFormRef"
        :rules="addCateFormRules"
        :model="addCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择 -->
          <el-cascader
            v-model="selecterKeys"
            :options="parentCataList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框尾部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateF">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <el-form
        ref="editCateFormRef"
        :rules="addCateFormRules"
        :model="editCateForm"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="editSelecterKeys"
            :options="parentCataList"
            :props="cascaderProps"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 对话框尾部 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateF">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询信息——分页
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      //   分类列表——渲染
      cateList: [],
      //   查询数据的总数-分页用
      total: 0,
      //   树形
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
          width: "400px",
        },
        {
          label: "是否有效",
          //当前列定义为模板列
          type: "template",
          //当前冽使用模板名称
          template: "isok",
        },
        {
          label: "排序",
          //当前列定义为模板列
          type: "template",
          //当前冽使用模板名称
          template: "order",
        },
        {
          label: "操作",
          //当前列定义为模板列
          type: "template",
          //当前冽使用模板名称
          template: "opt",
        },
      ],

      //   添加分类
      addCateDialogVisible: false,
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      //父级分类列表
      parentCataList: [],
      //指定级联选择器配置对象
      cascaderProps: {
        value: "cat_id",
        label: "cat_name",
        children: "children",
        //展开方式
        expandTrigger: "hover",
        // 叶子节点非必选
        checkStrictly: true,
      },
      //选中的ID
      selecterKeys: [],

      //   编辑分类
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0,
      },
      editSelecterKeys: [],
      editId: 0,
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      //   this.$message.success(res.meta.msg);
      console.log(res.data);
      this.cateList = res.data.result;
      this.total = res.data.total;
    },
    // 分页设置响应
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 显示-添加分类-对话框
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级分类
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      //   this.$message.success(res.meta.msg);
      //   console.log(res.data);
      this.parentCataList = res.data;
    },
    parentCateChanged() {
      //   console.log(this.selecterKeys);

      //如果选中id数组的长度大于0，
      if (this.selecterKeys.length > 0) {
        //其父亲id为数组最后一个值
        this.addCateForm.cat_pid =
          this.selecterKeys[this.selecterKeys.length - 1];
        //当前分类等级恰好等于长度
        this.addCateForm.cat_level = this.selecterKeys.length;
        return;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    addCateF() {
      //   console.log(this.addCateForm);
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post(
          "categories",
          this.addCateForm
        );
        if (res.meta.status !== 201) {
          this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getParentCateList();
        this.addCateDialogVisible = false;
        this.getCateList();
      });
    },
    addCateClosed() {
      this.$refs.addCateFormRef.resetFields();
      this.selecterKeys = [];
      this.addCateForm.cat_level = 0;
      this.addCateForm.cat_pid = 0;
    },

    //显示编辑分类对话框
    async editCateDialogShow(id) {
      this.editId = id;
      this.editCateDialogVisible = true;
      this.getParentCateList();
      const { data: res } = await this.$http.get("categories/" + id);
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      //   this.$message.success(res.meta.msg);
      this.editCateForm.cat_name = res.data.cat_name;
      this.editCateForm.cat_pid = res.data.cat_pid;
      this.editCateForm.cat_level = res.data.cat_level;
      console.log("pid" + this.editCateForm.cat_level);
    },

    //对话框关闭
    editCateDialogClosed() {
      this.editSelecterKeys = [];
      this.$refs.editCateFormRef.resetFields();
    },

    //对话框提交按钮——更新——编辑
    async editCateF() {
      console.log(this.editId);
      console.log(this.editCateForm.cat_name);
      const { data: res } = await this.$http.put(`categories/${this.editId}`, {
        cat_name: this.editCateForm.cat_name,
      });
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg);
      }
      this.$message.success(res.meta.msg);
      this.getCateList();
      this.editCateDialogVisible = false;
    },

    // 删除功能
    async deleCateDialogShow(id) {
      const confirmrResult1 = await this.$confirm(
        "此操作将删除该分类?",
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
      const { data: res } = await this.$http.delete("categories/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除分类失败!");
      }
      this.$message.success("删除分类成功！");
      this.getCateList();
    },
  },
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px !important;
}
.el-cascader {
  width: 100%;
}
</style>
