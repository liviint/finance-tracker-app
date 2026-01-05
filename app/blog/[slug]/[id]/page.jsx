import { blogApi } from "../../../../api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import LikeButton from "@/components/comments/LikeButton";
import Comments from "@/components/comments/Comments";
import "./blog.css";
import ViewsCount from "@/components/blogs/ViewsCount";
import Share from "@/components/blogs/Share";
import EditButton from "@/components/common/EditButton";
import DeleteBLog from "@/components/blogs/DeleteButton";
import UserLinkBtn from "@/components/profile/UserLinkBtn";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const res = await blogApi.get(`blogs/${id}`);
    const blog = res.data;

    if (!blog) return {};

    return {
      title: blog.title,
      description: blog.summary || blog.content.slice(0, 160),
      openGraph: {
        title: blog.title,
        description: blog.summary || blog.content.slice(0, 160),
        type: "article",
        url: `https://www.zeniahub.com/blog/${blog.slug}/${blog.id}`,
        images: [
              {
                  url: blog.image,
                  alt: `${blog.title}`,
              },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: blog.title,
        description: blog.summary || blog.content.slice(0, 160),
        images: [
              {
                  url: blog.image,
                  alt: `${blog.title}`,
              },
        ],
      },
    };
  } catch (err) {
    console.error("Error fetching blog for metadata", err);
    return {};
  }
}

const SingleBlogPage = async ({ params }) => {
  const { id } = params;
  const res = await blogApi.get(`blogs/${id}`);
  const blog = res.data;

  if (!blog) return <div className="not-found">Blog not found</div>;

  const { title, content, created_at, image, author, likes_count } = blog;

  return (
    <div className="blog-container">
      <div className="blog-header">
        {image && <img src={image} alt={title} className="blog-cover" />}
        <h1 className="blog-title">{title}</h1>
        <UserLinkBtn content={{
                  author:author,
                  created_at:created_at
                }} />
      </div>

      <article className="prose prose-lg max-w-none">
        <ReactMarkdown
          children={content.replace(/\\n/g, "\n").replace(/\n(?!\n)/g, "  \n")}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
        />
      </article>
      <div className="views-likes">
        <ViewsCount blogId={id}/>
        <LikeButton blogId={id} initialLikes={likes_count} />
        <Share />
        <EditButton 
          contentAuthor={blog.author}
          href={`/blog/edit/${blog.id}`}
        />
        <DeleteBLog id={id}/>
      </div>
      <Comments blogId={id} />
    </div>
  );
};

export default SingleBlogPage;
