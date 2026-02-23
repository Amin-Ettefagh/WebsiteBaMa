import { notFound } from 'next/navigation';
import { getLegacyPage } from '@/lib/legacy';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

type PageProps = {
  params?: { slug?: string[] };
};

export async function generateMetadata({ params }: PageProps) {
  const slug = params?.slug ?? [];
  const page = await getLegacyPage(slug);
  if (page.routeKey === 'not-found') {
    const notFoundTitle = 'Page not found';
    return { title: `${notFoundTitle} | ${SITE_NAME}` };
  }
  return {
    title: page.title || SITE_NAME,
    description: page.description || SITE_DESCRIPTION
  };
}

export default async function Page({ params }: PageProps) {
  const slug = params?.slug ?? [];
  const page = await getLegacyPage(slug);

  if (page.routeKey === 'not-found') {
    notFound();
  }

  return <div dangerouslySetInnerHTML={{ __html: page.html }} />;
}
