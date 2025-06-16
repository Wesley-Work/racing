import { RouteRecordRaw } from 'vue-router';

export const routerMaps: RouteRecordRaw[] = [
  {
    name: 'demo',
    path: '',
    component: () => import('@rac/client/src/components/demo.vue'),
  },
];
