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
    const notFoundTitle =
      '\u0635\u0641\u062d\u0647 \u0645\u0648\u0631\u062f \u0646\u0638\u0631';
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
