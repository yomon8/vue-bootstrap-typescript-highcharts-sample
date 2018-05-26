import Vue from "vue";
import Router from "vue-router";
import CW from "../components/cloudwatch/cloudwatch.vue";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Default",
      component: CW
    }
  ]
});
