import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "@/components/getPostMetadata";
import { DotFilledIcon } from "@radix-ui/react-icons";

const getPostContent = (slug: string) => {
  const folder = "posts/";
  const file = `${folder}${slug}.md`;
  const content = fs.readFileSync(file, "utf8");
  const matterResult = matter(content);
  return matterResult;
};

export const generateStaticParams = async () => {
  const posts = getPostMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
};

export default async function PostPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const { slug } = params;
  const post = getPostContent(slug);

  return (
    <div className="mx-auto p-6">
      {/* Post Title and Date */}
      <div className="my-12 flex items-center space-x-2">
        <h1 className="text-3xl font-bold text-foreground">
          {post.data.title}
        </h1>
        <DotFilledIcon className="text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{post.data.date}</p>
      </div>

      {/* Markdown Content */}
      <article className="prose dark:prose-invert max-w-none">
        <Markdown>{post.content}</Markdown>
      </article>
    </div>
  );
}
