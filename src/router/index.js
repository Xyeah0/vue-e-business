import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../components/Login";
import Home from "../components/Home";
import Welcome from "../components/Welcome";
import Users from "../components/user/Users";
import Roles from "../components/power/Roles";
import Rights from "../components/power/Rights";
import Cate from "../components/goods/Cate";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/home",
    component: Home,
    redirect: "/welcom",
    children: [
      {
        path: "/welcom",
        component: Welcome
      },
      {
        path: "/users",
        component: Users
      },
      {
        path: "/roles",
        component: Roles
      },
      {
        path: "/rights",
        component: Rights
      },
      {
        path: "/categories",
        component: Cate
      }
    ]
  },
];

const router = new VueRouter({
  routes,
});
router.beforeEach((to, from, next) => {
  if (to.path === "/login") return next();
  const tokenStr = window.sessionStorage.getItem("token");
  if (!tokenStr) return next("/login");
  next();
});
export default router;
