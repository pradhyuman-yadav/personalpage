import Link from "next/link";
import { PostMetadata } from "./PostMetadata";

// const PostPreview = (props: PostMetadata) => {
//   return (
//     <div className="p-4 rounded-md shadow-sm">
//       <p className="text-sm text-slate-400">{props.date}</p>

//       <Link href={`/posts/${props.slug}`}>
//         <h2 className=" text-violet-600 hover:underline mb-4">{props.title}</h2>
//       </Link>
//       <p className="text-slate-700">{props.subtitle}</p>
//     </div>
//   );
// };

// export default PostPreview;

const PostPreview = ({ date, slug, title, subtitle }: PostMetadata) => {
  return (
    <div className="p-4 rounded-md shadow-sm bg-card text-card-foreground border border-border transition-colors">
      <p className="text-sm text-muted-foreground">{date}</p>

      <Link href={`/posts/${slug}`} className="block mt-2">
        <h2 className="text-xl font-bold text-primary hover:underline transition-colors">
          {title}
        </h2>
      </Link>

      <p className="text-md text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
};

export default PostPreview;
