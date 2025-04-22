import { useState } from 'react'
import { signIn } from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../styles/Auth.css'

export default function SignIn() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { isSignedIn, nextStep } = await signIn({ 
        username, 
        password 
      })
      
      if (isSignedIn) {
        router.push('/')
      } else {
        // Handle additional sign-in steps if needed
        setError('Additional sign-in steps required')
      }
    } catch (err) {
      setError(err.message || 'Error signing in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign In</h1>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link href="/sign-up">
              <span className="auth-link">Sign Up</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}