export type ApiRes<T> = {
  success: boolean;
  result?: T;
  title?: string;
};
