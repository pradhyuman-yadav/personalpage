import fs from "fs";
import Markdown from "markdown-to-jsx";
import matter from "gray-matter";
import getPostMetadata from "../../../components/getPostMetadata";
import { DotFilledIcon } from "@radix-ui/react-icons"

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

export default async function PostPage(props: {params: Promise<{ slug: string }>}) {
  const params = await props.params;
  const { slug } = params;
  const post = getPostContent(slug);

  return (
    <div>
      <div className="my-12 flex items-center">
        <h1 className="text-2xl text-slate-600 ">{post.data.title}</h1>
        <div className="flex items-center px-2">
          <DotFilledIcon />
        </div>
        <p className="text-slate-400">{post.data.date}</p>
      </div>

      <div className="">
        <article className="prose text-slate-400">
          <Markdown>{post.content}</Markdown>
        </article>
      </div>
      
    </div>
  );
}
