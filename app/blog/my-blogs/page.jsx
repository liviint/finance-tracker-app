'use client';
import BlogsList from '@/components/blogs/BlogList';
import { useState,useEffect } from 'react';
import Link from 'next/link';
import { blogApi } from 'api';
import { useSelector } from 'react-redux';
import "../../blog/blogs.css"

const BlogsPage =  () => {
    const user = useSelector(state => state?.user?.userDetails)
    const [blogs,setBlogs] = useState(null)

    useEffect(() => {
        const fetchBlogs = () => {
            blogApi.get(`/blogs/?author=${user?.user?.id}`)
            .then(res => {
                console.log(res.data.results,"hello res")
                setBlogs(res.data.results)
            })
            .catch(error => console.log("hello error"))
        }
        fetchBlogs()
    },[])

    return (
        <div className="blogs-container">
        <h1 className="blogs-title">My Blog Posts</h1>
        <div className={"add-discussion-btn-container"} >
            <Link href="/blog/new" className={"add-discussion-btn"}>
                + Add New Blog
            </Link>
        </div>
            <BlogsList initialBlogs={blogs} author={user?.user?.id}/>
        </div>
    );
};

export default BlogsPage;
