import BlogsList from '@/components/blogs/BlogList';
import { blogApi } from 'api';
import "./blogs.css"

const BlogsPage = async () => {
    const res = await blogApi.get('/blogs/?published=true');
    const blogs = res.data.results;

    return (
        <div className="blogs-container">
        <h1 className="page-title">Our Latest Blog Posts</h1>
            <BlogsList />
        </div>
    );
};

export default BlogsPage;
