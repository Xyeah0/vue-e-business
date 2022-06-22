<template>
  <el-container class="home-container">
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="logo" /> <span>后台管理系统</span>
      </div>
      <el-button @click="logout">退出</el-button></el-header
    >
    <el-container>
      <el-aside width="200px">
        <el-menu
          router
          :unique-opened="true"
          class="el-menu-vertical-demo"
          @open="handleOpen"
          @close="handleClose"
          background-color="#323744"
          text-color="#fff"
          active-text-color="#41B883"
          :default-active="$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="`/${i.path}`" v-for="i in menueList" :key="i.id">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span>{{ i.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              v-for="j in i.children"
              :index="`/${j.path}`"
              :key="j.id"
              class="fixposition"
            >
              <i class="el-icon-location"></i>
              <span>{{ j.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <el-main>
        <div>
          <router-view></router-view>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      menueList: [],
    };
  },
  created() {
    this.getMenueList();
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    async getMenueList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      //   this.$message.success(res.meta.msg);
      this.menueList = res.data;
      console.log(res.data);
    },
  },
};
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
  .el-header {
    background-color: #373c41;
    color: #eaedf2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 26px;
    div {
      display: flex;
      align-items: center;
      span {
        margin-left: 16px;
      }
    }
    img {
      width: 60px;
      height: 60px;
    }
  }
  .el-aside {
    background-color: #323744;
    .el-menu {
      border-right: none;
    }
    .fixposition {
      padding-left: 75px !important;
    }
  }
  .el-main {
    background-color: #eaedf2;
  }
}
</style>
