import { useRouter } from 'next/router'
import ReactMarkdown from 'react-markdown'
import { generateClient } from 'aws-amplify/api'
import { getPost, listPosts } from '../../graphql/queries'
import { getCurrentUser } from 'aws-amplify/auth'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import '../../styles/Post.css'

export default function Post({ post }) {
  const router = useRouter()
  const [username, setUsername] = useState('')

  useEffect(() => {
    async function fetchUser() {
      try {
        const { username } = await getCurrentUser()
        setUsername(username)
      } catch (error) {
        console.error('Error fetching user:', error)
      }
    }
    fetchUser()
  }, [])

  if (router.isFallback) {
    return <div className="loading-container">Loading...</div>
  }

  return (
    <>
      <Head>
        <title>{post.title} | My Blog</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Head>
      
      <div className="post-container">
        <article className="post-content">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">by {username}</span>
            <span className="post-date">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <div className="post-body">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  )
}

export async function getStaticPaths() {
  const client = generateClient()
  const postData = await client.graphql({ query: listPosts })
  const paths = postData.data.listPosts.items.map(post => ({ 
    params: { id: post.id }
  }))
  
  return {
    paths,
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  const client = generateClient()
  const { id } = params
  const postData = await client.graphql({
    query: getPost,
    variables: { id }
  })

  return {
    props: {
      post: postData.data.getPost
    },
    revalidate: 60 
  }
}