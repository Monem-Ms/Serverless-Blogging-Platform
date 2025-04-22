import { useState } from 'react'
import { signUp } from 'aws-amplify/auth'
import { useRouter } from 'next/router'
import Link from 'next/link'
import '../styles/Auth.css'

export default function SignUp() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [signUpComplete, setSignUpComplete] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState('')
  const router = useRouter()

  const handleSignUp = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email
          },
          autoSignIn: true
        }
      })

      if (isSignUpComplete) {
        router.push('/')
      } else {
        setSignUpComplete(true)
      }
    } catch (err) {
      setError(err.message || 'Error signing up')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmation = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode
      })

      if (isSignUpComplete) {
        router.push('/')
      }
    } catch (err) {
      setError(err.message || 'Error confirming sign up')
    } finally {
      setIsLoading(false)
    }
  }

  if (signUpComplete) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Confirm Sign Up</h1>
          {error && <p className="error-message">{error}</p>}
          
          <form onSubmit={handleConfirmation}>
            <div className="form-group">
              <label htmlFor="confirmationCode">Confirmation Code</label>
              <input
                id="confirmationCode"
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                required
              />
              <p className="hint">Check your email for the confirmation code</p>
            </div>
            
            <button 
              type="submit" 
              className="auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Confirming...' : 'Confirm'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Sign Up</h1>
        {error && <p className="error-message">{error}</p>}
        
        <form onSubmit={handleSignUp}>
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            {isLoading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link href="/sign-in">
              <span className="auth-link">Sign In</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}