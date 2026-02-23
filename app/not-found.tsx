import Link from 'next/link';
import { SITE_NAME } from '@/lib/site';

export default function NotFound() {
  return (
    <div>
      <h1>Page not found</h1>
      <p>The page you requested does not exist on {SITE_NAME}.</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}
