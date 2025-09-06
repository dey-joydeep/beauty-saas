export interface ThemeParams {
  id?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  isDefault?: boolean;
  previewImageUrl?: string;
  styles: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    borderRadius?: string;
    boxShadow?: string;
    transition?: string;
  };
  layout: {
    header: {
      backgroundColor?: string;
      textColor?: string;
      height?: string;
      position?: 'fixed' | 'static' | 'sticky';
      showLogo?: boolean;
      showSearch?: boolean;
      showUserMenu?: boolean;
    };
    footer: {
      backgroundColor?: string;
      textColor?: string;
      showCopyright?: boolean;
      showSocialLinks?: boolean;
      showNewsletter?: boolean;
    };
    sidebar: {
      width?: string;
      backgroundColor?: string;
      textColor?: string;
      collapsedWidth?: string;
      collapsedIconOnly?: boolean;
    };
  };
  components?: {
    button?: {
      borderRadius?: string;
      padding?: string;
      fontSize?: string;
      fontWeight?: string | number;
      textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
    };
    card?: {
      borderRadius?: string;
      boxShadow?: string;
      padding?: string;
    };
    input?: {
      borderRadius?: string;
      borderColor?: string;
      focusBorderColor?: string;
      errorBorderColor?: string;
    };
  };
  customCss?: string;
  customJs?: string;
  metadata?: Record<string, any>;
}

export interface CreateThemeParams extends Omit<ThemeParams, 'id'> {
  createdBy: string;
}

export interface UpdateThemeParams extends Partial<Omit<ThemeParams, 'id'>> {
  id: string;
  updatedBy: string;
}

export interface ThemeQueryParams {
  search?: string;
  isActive?: boolean;
  isDefault?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ThemeActivationParams {
  themeId: string;
  activate: boolean;
  updatedBy: string;
}

export interface ThemePreviewParams {
  themeId: string;
  previewUrl: string;
  updatedBy: string;
}

export interface ThemeExportParams {
  themeId: string;
  includeAssets?: boolean;
  includeTemplates?: boolean;
  includeSettings?: boolean;
}

export interface ThemeImportParams {
  name: string;
  description?: string;
  themeData: any;
  createdBy: string;
  overrideExisting?: boolean;
}

export interface ThemeTemplateParams {
  id?: string;
  name: string;
  content: string;
  type: 'page' | 'section' | 'component' | 'email' | 'other';
  description?: string;
  previewImageUrl?: string;
  isActive?: boolean;
  metadata?: Record<string, any>;
}

export interface ThemeAssetParams {
  id?: string;
  name: string;
  url: string;
  type: 'image' | 'script' | 'style' | 'font' | 'other';
  mimeType?: string;
  size?: number;
  isActive?: boolean;
  metadata?: Record<string, any>;
}
