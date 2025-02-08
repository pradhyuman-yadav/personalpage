import getPostMetadata from "@/components/getPostMetadata";
import PostPreview from "@/components/PostPreview";

function Home() {
  const postMetadata = getPostMetadata();

  const sortedPostMetadata = postMetadata.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const postPreviews = sortedPostMetadata.map((post) => (
    <PostPreview key={post.slug} {...post} />
  ));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {postPreviews}
    </div>
  );
}

export default Home;
