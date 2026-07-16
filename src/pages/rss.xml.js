import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE_NAME, SITE_DESCRIPTION } from '../lib/site';

export async function GET(context) {
  const articles = (await getCollection('articles')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.excerpt,
      pubDate: article.data.date,
      link: `/articles/${article.id}`,
      categories: [article.data.category],
    })),
  });
}
