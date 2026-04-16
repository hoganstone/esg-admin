import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CORS = {
  'Access-Control-Allow-Origin': process.env.FRONTEND_URL ?? 'https://esg-frontend-pied.vercel.app',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }
export async function GET() {
  const metrics = await prisma.esgMetric.findMany({ orderBy: [{ year: 'asc' }, { category: 'asc' }] });
  return NextResponse.json(metrics, { headers: CORS });
}
