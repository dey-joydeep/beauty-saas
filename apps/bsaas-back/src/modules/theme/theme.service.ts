import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ThemeService for theme module
// NOTE: 'Theme' type is not exported from @prisma/client. Define a local interface for Theme matching your DB schema.

export type Theme = {
  id: string;
  name: string;
  colors: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type GetThemeByIdParams = {
  id: string;
};

export type DeleteThemeParams = {
  id: string;
};

function mapTheme(prismaTheme: any): Theme {
  return {
    id: prismaTheme.id,
    name: prismaTheme.name,
    colors: prismaTheme.colors,
    isActive: prismaTheme.isActive,
    createdAt: prismaTheme.createdAt,
    updatedAt: prismaTheme.updatedAt,
  };
}

export class ThemeService {
  async getThemes(params: { filter?: any }): Promise<Theme[]> {
    const themes = await prisma.theme.findMany({ where: params.filter });
    return themes.map(mapTheme);
  }

  async getThemeById(params: GetThemeByIdParams): Promise<Theme | null> {
    const theme = await prisma.theme.findUnique({ where: { id: params.id } });
    return theme ? mapTheme(theme) : null;
  }

  async createTheme(params: {
    data: { name: string; colors: any; isActive?: boolean };
  }): Promise<Theme> {
    const theme = await prisma.theme.create({
      data: {
        name: params.data.name,
        colors: params.data.colors,
        isActive: params.data.isActive ?? true,
      },
    });
    return mapTheme(theme);
  }

  async updateTheme(params: {
    id: string;
    data: Partial<Omit<Theme, 'id'>>;
  }): Promise<Theme | null> {
    const updateData: any = {};
    if (params.data.name !== undefined) updateData.name = params.data.name;
    if (params.data.colors !== undefined) updateData.colors = params.data.colors;
    if (params.data.isActive !== undefined) updateData.isActive = params.data.isActive;
    const theme = await prisma.theme.update({ where: { id: params.id }, data: updateData });
    return mapTheme(theme);
  }

  async deleteTheme(params: DeleteThemeParams): Promise<void> {
    await prisma.theme.delete({ where: { id: params.id } });
    return;
  }
}
