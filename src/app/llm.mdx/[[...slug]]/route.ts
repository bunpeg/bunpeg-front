import { type NextRequest, NextResponse } from 'next/server';
import { notFound } from 'next/navigation';

import { docs, getLLMText } from '@/utils/docs';

export const revalidate = false;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await params;
  const page = docs.getPage(slug);
  if (!page) notFound();
  return new NextResponse(await getLLMText(page));
}
export function generateStaticParams() {
  return docs.generateParams();
}
