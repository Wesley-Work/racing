import { RouteRecordRaw } from 'vue-router';

export const routerMaps: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '',
    component: () => import('@rac/client/src/pages/index.vue'),
  },
  {
    name: 'demo',
    path: '/demo',
    component: () => import('@rac/client/src/components/demo.vue'),
  },
];
