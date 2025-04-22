import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { postsByOwner } from '../graphql/queries'
import { deletePost as deletePostMutation } from '../graphql/mutations'
import '../styles/MyPosts.css'

export default function MyPosts() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      setError(null)
      
      const client = generateClient()
      const { userId } = await getCurrentUser()
      
      const { data, errors } = await client.graphql({
        query: postsByOwner,
        variables: { owner: userId },
        authMode: 'userPool'
      })

      if (errors) throw new Error(errors[0].message)
      setPosts(data?.postsByOwner?.items || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  async function deletePost(id) {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this post?')
      if (!confirmed) return

      const client = generateClient()
      await client.graphql({
        query: deletePostMutation,
        variables: { input: { id } },
        authMode: 'userPool'
      })

      setPosts(posts.filter(post => post.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete post')
      fetchPosts()
    }
  }

  if (loading) return <div className="loading-spinner"></div>

  if (error) return (
    <div className="error-container">
      <p className="error-message">{error}</p>
      <button onClick={fetchPosts} className="retry-button">Try Again</button>
    </div>
  )

  return (
    <div className="my-posts-container">
      <h1 className="page-title">My Posts</h1>
      
      {posts.length === 0 ? (
        <div className="empty-state">
          <p>You haven't created any posts yet.</p>
          <Link href="/create-post" className="create-link">Create your first post</Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <h2 className="post-title">{post.title}</h2>
              <p className="post-date">
                Created: {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <div className="post-actions">
                <Link href={`/edit-post/${post.id}`} className="action-link edit">Edit</Link>
                <Link href={`/posts/${post.id}`} className="action-link view">View</Link>
                <button 
                  onClick={() => deletePost(post.id)} 
                  className="action-link delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}