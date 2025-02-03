export class ResponseDto<T> {
  status_code: number;
  result: string;
  detail: T;

  constructor(partial: Partial<ResponseDto<T>>) {
    Object.assign(this, partial);
  }
}
