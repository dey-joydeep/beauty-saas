export const MODULE_TEMPLATE = {
  structure: {
    components: {
      base: {
        component: 'base.component.ts',
        template: 'base.component.html',
        styles: 'base.component.scss',
        spec: 'base.component.spec.ts',
      },
      list: {
        component: 'list.component.ts',
        template: 'list.component.html',
        styles: 'list.component.scss',
        spec: 'list.component.spec.ts',
      },
      detail: {
        component: 'detail.component.ts',
        template: 'detail.component.html',
        styles: 'detail.component.scss',
        spec: 'detail.component.spec.ts',
      },
    },
    services: {
      base: 'base.service.ts',
      api: 'api.service.ts',
    },
    guards: {
      auth: 'auth.guard.ts',
      permission: 'permission.guard.ts',
    },
    module: {
      module: 'module.module.ts',
      routing: 'module-routing.module.ts',
    },
  },
  patterns: {
    naming: {
      module: 'module-name',
      component: 'module-name.component',
      service: 'module-name.service',
      guard: 'module-name.guard',
    },
    selectors: {
      prefix: 'bsaas-',
      component: 'bsaas-module-name',
    },
  },
  bestPractices: {
    components: {
      standalone: true,
      imports: ['CommonModule'],
      template: './module-name.component.html',
      styles: ['./module-name.component.scss'],
    },
    services: {
      providedIn: 'root',
      injectable: true,
    },
    guards: {
      providedIn: 'root',
      canActivate: true,
    },
    modules: {
      imports: ['BasemoduleModule'],
      exports: [],
      declarations: [],
      providers: [],
    },
  },
};
