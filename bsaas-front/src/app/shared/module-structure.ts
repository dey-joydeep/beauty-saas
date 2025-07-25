export interface ModuleStructure {
  // Component structure
  components: {
    [key: string]: {
      component: string;
      template: string;
      styles: string;
      spec: string;
    };
  };

  // Service structure
  services: {
    [key: string]: string;
  };

  // Guard structure
  guards: {
    [key: string]: string;
  };

  // Module structure
  module: {
    feature: string;
    routing: string;
  };
}
