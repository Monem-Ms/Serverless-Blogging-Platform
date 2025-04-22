import { withAuthenticator } from '@aws-amplify/ui-react'
import { useState } from 'react'
import { generateClient } from 'aws-amplify/api'
import { getCurrentUser } from 'aws-amplify/auth'
import { v4 as uuid } from 'uuid'
import { useRouter } from 'next/router'
import SimpleMDE from "react-simplemde-editor"
import "easymde/dist/easymde.min.css"
import { createPost } from '../graphql/mutations'
import '../styles/CreatePost.css'

const initialState = { title: '', content: '' }

function CreatePost() {
  const client = generateClient()
  const [post, setPost] = useState(initialState)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { title, content } = post
  const router = useRouter()
  
  const onChange = (e) => {
    setPost(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError('')
  }
  
  const createNewPost = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Both title and content are required')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      // Get current authenticated user
      const { userId } = await getCurrentUser()
      
      const id = uuid()
      const input = {
        id,
        title: title.trim(),
        content: content.trim(),
        owner: userId,  // Important: Include the owner field
        createdAt: new Date().toISOString()
      }

      const { data, errors } = await client.graphql({
        query: createPost,
        variables: { input },
        authMode: 'userPool'  // Standard auth mode for Cognito User Pools
      })

      if (errors) {
        throw new Error(errors[0].message)
      }

      if (data?.createPost) {
        router.push(`/posts/${id}`)
      } else {
        throw new Error('Failed to create post')
      }
    } catch (err) {
      console.error('Error creating post:', err)
      setError(err.message || 'An error occurred while creating the post')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="create-post-container">
      <h1 className="create-post-title">Create new post</h1>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <input
        onChange={onChange}
        name="title"
        placeholder="Title"
        value={title}
        className="post-title-input"
        disabled={isLoading}
      />
      
      <div className="editor-container">
        <SimpleMDE 
          value={content} 
          onChange={value => setPost(prev => ({ ...prev, content: value }))}
          options={{
            spellChecker: false,
            status: false,
            placeholder: 'Write your post content here...',
            autosave: { enabled: false },
            hideIcons: ['side-by-side', 'fullscreen']
          }}
        />
      </div>
      
      <button
        type="button"
        className="create-post-button"
        onClick={createNewPost}
        disabled={isLoading || !title.trim() || !content.trim()}
      >
        {isLoading ? (
          <span className="button-loading">
            <span className="spinner"></span>
            Creating...
          </span>
        ) : (
          'Create Post'
        )}
      </button>
    </div>
  )
}

export default withAuthenticator(CreatePost, {
  loginMechanisms: ['email'],
  socialProviders: [], // Remove if you want social login
  signUpAttributes: ['email'] // Fields required for signup
})