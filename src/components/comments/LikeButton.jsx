'use client';
import { useState, useEffect } from 'react';
import { blogApi } from 'api';
import { useSelector } from 'react-redux';
import Like from '../common/Like';

export default function LikeButton({ blogId, initialLikes }) {
    const user = useSelector(state => state?.user?.userDetails)
    const [likes, setLikes] = useState(initialLikes);
    const [liked, setLiked] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const hasUserLiked = () => {
            blogApi.get(`/blogs/${blogId}/like/`,
                { headers: { Authorization: `Bearer ${user.access}` } }
            ).then(res => {
                setLiked(res.data.liked);
            })
            .catch(error => console.log(error,"err"))
        }
        user && hasUserLiked()
    },[])

  const handleLike = async () => {
    setError('');
    if (!user) {
      setError('You must be logged in to like posts.');
      return;
    }

    try {
      const res = await blogApi.post(
        `/blogs/${blogId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${user.access}` } }
      );
      if (res.status === 200) {
        setLiked(true);
        setLikes((prev) => prev + 1);
      }
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An error occurred.');
      }
    }
  };

  return (
    <Like 
      liked={liked}
      handleLike={handleLike}
      likes={likes}
      error={error}
    />
  );
}
