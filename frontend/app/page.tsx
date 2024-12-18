import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(options);
  
  //console.log('Session:', JSON.stringify(session, null, 2));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
        Welcome to your Next.js App
      </h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        {session ? (
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome {session.user?.name || 'User'}</h2>
            <p className="mb-2"><strong>ID:</strong> {session.user_id || 'Unknown ID'}</p>
            <p className="mb-2"><strong>Role:</strong> {session.role || 'Unknown Role'}</p>
          </div>
        ) : (
          <h2 className="text-3xl font-bold text-red-500 text-center">You Shall Not Pass!</h2>
        )}
      </div>
    </div>
  );
}
