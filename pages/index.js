import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listPosts } from '../graphql/queries'
import { generateClient } from 'aws-amplify/api'
import '../styles/PostList.css'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const client = generateClient()

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      setLoading(true)
      const { data } = await client.graphql({ query: listPosts })
      setPosts(data.listPosts.items)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="posts-container">
      <h1 className="posts-header">Latest Articles</h1>
      
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          No articles found. Be the first to create one!
        </div>
      ) : (
        <div className="post-list">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/posts/${post.id}`} 
              className="post-link"
              passHref
            >
              <div className="post-item">
                <h2 className="post-title">{post.title}</h2>
                {post.content && (
                  <p className="post-excerpt">
                    {post.content.substring(0, 120)}...
                  </p>
                )}
                <div className="post-meta">
                  <span className="post-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M3 9h18V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-4"></path>
                      <line x1="16" y1="3" x2="16" y3="7"></line>
                      <line x1="8" y1="3" x2="8" y3="7"></line>
                      <line x1="3" y1="13" x2="21" y3="13"></line>
                    </svg>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}