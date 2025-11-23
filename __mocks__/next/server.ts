export class NextResponse {
  // minimal fields you need for testing
  status: number;
  body: any;
  headers: any;

  constructor(body: any, init: any = {}) {
    this.body = body;
    this.status = init?.status ?? 200;
    this.headers = init?.headers ?? {};
  }

  static json(body: any, init: any = {}) {
    return new NextResponse(body, init);
  }
}