'use client';
import { useState, useEffect } from "react";
import { blogApi } from "api";
import { useSelector } from "react-redux";
import Link from 'next/link'
import "./comments.css"
import LoginFirst from "../common/LoginFirst";

export default function Comments({ blogId}) {
    const user = useSelector(state => state?.user?.userDetails)
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData,setFormData] = useState({
        author:user?.user?.id,
        blog:blogId,
        content:"",
    })

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await blogApi.get(`blogs/comments/?blog=${blogId}`);
        setComments(res.data.results);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };
    fetchComments();
  }, [blogId]);

  // Handle comment submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setLoading(true);

    try {
        const res = await blogApi.post(
            `blogs/comments/?blog=${blogId}`,
            formData, 
            {
                headers: { Authorization: `Bearer ${user.access}` },
            }
    );
            setComments([res.data, ...comments]);
            setFormData(prev => ({...prev,content:""}))
        } catch (err) {
            console.error("Error posting comment:", err);
        } finally {
            setLoading(false);
        }
  };

  return (
    <div className="comments-section">
      <h3>Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          placeholder="Write a comment..."
          value={formData.content}
          onChange={(e) => setFormData(prev => ({...prev,content:e.target.value}))}
          disabled={!user}
        ></textarea>
        <button type="submit" disabled={loading || !user}>
          {loading ? "Posting..." : "Post Comment"}
        </button>
        <LoginFirst />
      </form>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <p className="author">{comment.author_name}</p>
              <p className="content">{comment.content}</p>
              <p className="date">{new Date(comment.created_at).toLocaleString()}</p>
            </div>
          ))
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
