import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      <h1 className="text-5xl font-extrabold text-primary mb-6 text-center">
        Welcome to E-Learning Platform
      </h1>
      <div className="card w-full max-w-lg">
        {session ? (
          <div className="text-center">
            <h2 className="text-3xl font-semibold mb-4">
              Welcome, {session.user?.name || "User"}!
            </h2>
            <p className="text-lg mb-2">
              <strong>ID:</strong> {session.user_id || "Unknown ID"}
            </p>
            <p className="text-lg">
              <strong>Role:</strong> {session.role || "Unknown Role"}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-3xl font-semibold text-secondary mb-4">
              Welcome!
            </h2>
            <p className="text-lg">
              Please sign in to access your personalized dashboard.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
