import { NextResponse } from 'next/server';
class ApiHandler {
  async handle() {
    const data = await this.fetchData();
    return NextResponse.json({ data });
  }
  async fetchData() { /* ... */ }
}
