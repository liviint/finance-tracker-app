'use client'
import React, { useEffect, useState } from 'react';
import { blogApi } from 'api';

const ViewsCount = ({ blogId }) => {
  const [views, setViews] = useState(null);

  useEffect(() => {
    if (!blogId) return;

    const trackView = async () => {
      try {
        const res = await blogApi(
          `/blogs/${blogId}/track_view/`,
          {
            method: 'POST',
            withCredentials: true, 
          }
        );
        setViews(res.data.views_count); 
      } catch (err) {
        console.error('Error tracking views:', err);
      }
    };

    trackView();
  }, [blogId]);

  if (views === null) return null; 

  return (
    <div>
      <p className="views-count">
        👁️ {views} {views === 1 ? 'view' : 'views'}
      </p>
    </div>
  );
};

export default ViewsCount;
