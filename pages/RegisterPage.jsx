import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

const PostPage = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Fetch post content from Google Sheets
        const sheetPost = await fetchPostFromSheet(postId);

        // Fetch metadata from Firestore
        const docRef = doc(db, 'posts', postId);
        const docSnapshot = await getDoc(docRef);
        const firestoreData = docSnapshot.data();

        setPost(sheetPost);
        setMetadata(firestoreData);
      } catch (error) {
        console.error('Error fetching post data:', error);
      }
    };

    fetchPostData();
  }, [postId]);

  if (!post || !metadata) return <div>Loading...</div>;

  return (
    <div className="post-page bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4">{post.username}'s Post</h1>
      <p className="text-gray-700 leading-relaxed mb-4">{post.content}</p>

      {/* Media */}
      {post.mediaUrl && (
        <img src={post.mediaUrl} alt="Post" className="w-full rounded mb-4" />
      )}

      {/* Metadata */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-600">Likes: {metadata.likes}</span>
        </div>
        <div>
          <button className="btn btn-primary mr-2">Like</button>
          <button className="btn btn-secondary">Comment</button>
        </div>
      </div>

      {/* Comments */}
      <h2 className="text-lg font-medium mt-6">Comments</h2>
      <ul>
        {metadata.comments?.map((comment, index) => (
          <li key={index} className="mb-2">
            <strong>{comment.userId}</strong>: {comment.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostPage;