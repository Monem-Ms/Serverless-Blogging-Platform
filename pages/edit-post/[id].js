// pages/edit-post/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"
import { getPost } from '../../graphql/queries'
import { updatePost } from '../../graphql/mutations'
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import '../../styles/EditPost.css'

function EditPost() {
  const client = generateClient()
  const [post, setPost] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    async function fetchData() {
      if (!id) return
      
      try {
        // Get current user first
        const user = await getCurrentUser()
        setCurrentUser(user)
        
        // Then fetch the post
        const { data } = await client.graphql({ 
          query: getPost, 
          variables: { id }
        })
        
        const fetchedPost = data.getPost
        
        // Verify ownership
        if (fetchedPost.owner !== user.userId) {
          setError('You are not authorized to edit this post')
          return
        }
        
        setPost(fetchedPost)
      } catch (error) {
        console.error('Error:', error)
        setError(error.message || 'An error occurred')
      }
    }
    
    fetchData()
  }, [id])

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value })
  }

  const handleEditorChange = (value) => {
    setPost({ ...post, content: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!post?.title?.trim() || !post?.content?.trim()) {
      setError('Both title and content are required')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const { data } = await client.graphql({
        query: updatePost,
        variables: {
          input: {
            id: post.id,
            title: post.title.trim(),
            content: post.content.trim()
            // owner is automatically handled by Amplify auth
          }
        },
        authMode: "userPool" // Changed to standard auth mode
      })
      console.log(data);
      
      if (data?.updatePost) {
        router.push(`/posts/${post.id}`)
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update post. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button 
          className="back-button"
          onClick={() => router.push('/')}
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="loading-container">
        Loading post...
      </div>
    )
  }

  return (
    <div className="edit-post-container">
      <h1>Edit Post</h1>
      
      <form onSubmit={handleSubmit}>
        <input
          onChange={handleChange}
          name="title"
          placeholder="Post Title"
          value={post.title}
          className="post-title-input"
          disabled={isSaving}
          required
        />
        
        <div className="editor-wrapper">
          <SimpleMDE
            value={post.content}
            onChange={handleEditorChange}
            options={{
              spellChecker: false,
              status: false,
              placeholder: 'Write your post content here...',
              autosave: { enabled: false },
              hideIcons: ['side-by-side', 'fullscreen']
            }}
          />
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="save-button"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="button-loading">
                <span className="spinner"></span>
                Saving...
              </span>
            ) : 'Update Post'}
          </button>
          
          <button
            type="button"
            className="cancel-button"
            onClick={() => router.push(`/posts/${post.id}`)}
            disabled={isSaving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default EditPost