import { Authenticator } from '@aws-amplify/ui-react';
import { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  }

  if (!user) return null;

  return (
    <Authenticator>
      {({ signOut }) => (
        <div>
          <h1 className="text-3xl font-semibold tracking-wide mt-6">Profile</h1>
          <h3 className="font-medium text-gray-500 my-2">Username: {user.username}</h3>
          <button
            onClick={signOut}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Sign Out
          </button>
        </div>
      )}
    </Authenticator>
  );
}
