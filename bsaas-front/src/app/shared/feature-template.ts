export const FEATURE_TEMPLATE = {
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
      feature: 'feature.module.ts',
      routing: 'feature-routing.module.ts',
    },
  },
  patterns: {
    naming: {
      feature: 'feature-name',
      component: 'feature-name.component',
      service: 'feature-name.service',
      guard: 'feature-name.guard',
    },
    selectors: {
      prefix: 'bsaas-',
      component: 'bsaas-feature-name',
    },
  },
  bestPractices: {
    components: {
      standalone: true,
      imports: ['CommonModule'],
      template: './feature-name.component.html',
      styles: ['./feature-name.component.scss'],
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
      imports: ['BaseFeatureModule'],
      exports: [],
      declarations: [],
      providers: [],
    },
  },
};
