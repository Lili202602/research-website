// 文章数据常量 - 自动生成，请勿手动编辑

// 文章数据类型定义
export interface Article {
  id: number;
  title: string;
  date: string;
  coreViewpoints: string;
  comments: string;
  pdfUrl: string;
  fileSize: string;
  postUrl: string;
  tags?: string[];
}

// 明确指定类型，即使数组为空也能正确推断类型
export const ARTICLES_DATA: Article[] = [];
