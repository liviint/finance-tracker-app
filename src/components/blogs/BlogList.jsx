'use client';

import { useState, useEffect } from 'react';
import { blogApi } from 'api';
import EditButton from '../common/EditButton';
import UserLinkBtn from '../profile/UserLinkBtn';

export default function BlogsList({ initialBlogs, author }) {
    const [blogs, setBlogs] = useState(initialBlogs || []);

    useEffect(() => {
        if (!initialBlogs) fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        try {
            let url = author ? `/blogs/?author=${author}` : '/blogs/?published=true';
            const res = await blogApi.get(url);
            setBlogs(res.data.results);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="blogs-grid">
            {blogs.map(blog => (
                <div key={blog.id} className="blog-card">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="blog-title">{blog.title}</h2>

                        {author ? <span
                            className={`px-2 py-1 text-xs font-bold rounded-full ${
                                blog.published ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                            }`}
                        >
                            {blog.published ? 'Published' : 'Draft'}
                        </span> : ''}

                    </div>

                    <UserLinkBtn content={{
                        author:blog.author,
                        created_at:blog.created_at
                    }} />

                    <p className="blog-summary">{blog.summary}</p>
                    <a href={`/blog/${blog.slug}/${blog.id}`} className="read-more">
                        Read More →
                    </a>

                    <EditButton 
                        loggedUser={author}
                        contentAuthor={blog.author}
                        href={`/blog/edit/${blog.id}`}
                    />
                </div>
            ))}
        </div>
    );
}
