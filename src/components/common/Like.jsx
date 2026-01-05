import React from 'react'

const Like = ({liked,handleLike,likes,error}) => {
  return (
    <div className="like-section">
      <button
        className={`like-button ${liked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={liked}
      >
        ❤️ {likes}
      </button>
      {error && <p className="error-text">{error}</p>}

      <style jsx>{`
        .like-section {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .like-button {
          background: ${liked ? '#ff6b6b' : '#eee'};
          border: none;
          color: ${liked ? '#fff' : '#333'};
          padding: 0.5rem 1rem;
          border-radius: 25px;
          cursor: ${liked ? 'not-allowed' : 'pointer'};
          transition: 0.3s ease;
          font-weight: 600;
        }

        .like-button:hover {
          background: #ff6b6b;
          color: white;
        }

        .error-text {
          color: red;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}

export default Like