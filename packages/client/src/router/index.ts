import { createRouter, createWebHashHistory, RouteRecordRaw, RouterOptions } from 'vue-router';
import RenderComponents from './renderComponent';
import { routerMaps } from '@rac/config/routerMaps';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: RenderComponents,
    children: [...routerMaps],
  },
  {
    path: '/',
    redirect: '/demo',
  },
  {
    path: '/:w+',
    redirect: '/demo',
  },
];

const routerConfig: RouterOptions = {
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from) {
    if (to.path !== from.path) {
      return { top: 0 };
    }
  },
};

const router = createRouter(routerConfig);

export default router;
