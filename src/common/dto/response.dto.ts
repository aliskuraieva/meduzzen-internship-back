export class ResponseDto<T> {
  status_code: number;
  result: string;
  detail: T;
}