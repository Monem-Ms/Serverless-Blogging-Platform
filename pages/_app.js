import '../configureAmplify'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Auth } from 'aws-amplify'
import { Hub } from 'aws-amplify/utils'
import { getCurrentUser, signOut } from 'aws-amplify/auth'
import "../styles/styles.css"
import { useRouter } from 'next/router'

function MyApp({ Component, pageProps }) {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    isLoading: true
  })

  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser()
        setAuthState({
          isAuthenticated: true,
          user,
          isLoading: false
        })
      } catch (error) {
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        })
      }
    }

    const hubListener = Hub.listen('auth', async ({ payload: { event } }) => {
      switch (event) {
        case 'signIn':
          await checkAuth()
          router.push('/') // Redirect to home after sign in
          break
        case 'signOut':
          setAuthState({
            isAuthenticated: false,
            user: null,
            isLoading: false
          })
          router.push('/sign-in') // Redirect after sign out
          break
      }
    })

    checkAuth()

    return () => hubListener()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut({ global: true }) // optional: global sign-out
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      })
      router.push('/sign-in')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (authState.isLoading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }

  const showNav = !['/sign-in', '/sign-up'].includes(router.pathname)

  return (
    <div className="app-container">
      {showNav && (
        <nav className="navbar">
          <div className="nav-left">
            <Link href="/">
              <span className="nav-link">Home</span>
            </Link>
            {authState.isAuthenticated && (
              <>
                <Link href="/create-post">
                  <span className="nav-link">Create Post</span>
                </Link>
                <Link href="/my-posts">
                  <span className="nav-link">My Posts</span>
                </Link>
              </>
            )}
          </div>

          <div className="nav-right">
            {authState.isAuthenticated ? (
              <>
                <Link href="/profile">
                  <span className="nav-link profile-link">
                    {authState.user?.username || 'Profile'}
                  </span>
                </Link>
                <span 
                  className="nav-link sign-out" 
                  onClick={handleSignOut}
                  role="button"
                  tabIndex={0}
                >
                  Sign Out
                </span>
              </>
            ) : (
              <Link href="/sign-in">
                <span className="nav-link sign-in">Sign In</span>
              </Link>
            )}
          </div>
        </nav>
      )}

      <div className={`main-content ${!showNav ? 'auth-page' : ''}`}>
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
