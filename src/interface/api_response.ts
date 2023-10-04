export interface WebResponse<Data>{
  code: number;
  status: string;
  message: string;
  data: Data
}