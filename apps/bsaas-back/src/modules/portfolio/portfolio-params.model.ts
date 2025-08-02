// moved from models/portfolio-params.model.ts
// PortfolioParams for portfolio module

export interface GetPortfoliosParams {
  filter: Record<string, any>;
}

export interface CreatePortfolioParams {
  data: {
    userId: string;
    images: string[];
    description: string;
  };
}

export interface UpdatePortfolioParams {
  id: string;
  data: Partial<Omit<CreatePortfolioParams['data'], 'id'>>;
}

export interface DeletePortfolioParams {
  id: string;
}

export interface GetPortfolioByIdParams {
  id: string;
}
