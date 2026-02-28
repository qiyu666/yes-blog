import { getCollection } from "astro:content";

interface PostIndex {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  published: string;
  updated: string;
}

export async function generateContentIndex(): Promise<PostIndex[]> {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  
  return Promise.all(
    posts.map(async (post) => {
      // 读取文章内容
      const { Content } = await post.render();
      const content = Content();
      
      // 提取纯文本内容
      const plainContent = content
        .replace(/<[^>]*>/g, '')  // 移除HTML标签
        .replace(/\s+/g, ' ')     // 合并空白字符
        .trim();
      
      return {
        slug: post.slug,
        title: post.data.title,
        description: post.data.description,
        content: plainContent,
        tags: post.data.tags || [],
        published: post.data.published.toISOString(),
        updated: post.data.updated?.toISOString() || post.data.published.toISOString(),
      };
    })
  );
}

export function searchContentIndex(index: PostIndex[], query: string): PostIndex[] {
  const keywords = query.toLowerCase().split(/\s+/).filter(Boolean);
  
  return index
    .map((post) => {
      let score = 0;
      
      // 标题匹配
      if (post.title.toLowerCase().includes(query.toLowerCase())) {
        score += 10;
      }
      
      // 描述匹配
      if (post.description.toLowerCase().includes(query.toLowerCase())) {
        score += 5;
      }
      
      // 内容匹配
      keywords.forEach((keyword) => {
        if (post.content.toLowerCase().includes(keyword)) {
          score += 2;
        }
      });
      
      // 标签匹配
      keywords.forEach((keyword) => {
        if (post.tags.some((tag) => tag.toLowerCase().includes(keyword))) {
          score += 3;
        }
      });
      
      return { ...post, score };
    })
    .filter((post) => post.score > 0)
    .sort((a, b) => (b.score as number) - (a.score as number))
    .slice(0, 5);
}
