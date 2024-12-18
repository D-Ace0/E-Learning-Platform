import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(options);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-4xl font-bold text-center">
        Welcome to your Next.js app
      </h1>
      <>
        {session ? (
          <h1>Welcome {session.user?.name || 'User'}</h1>
        ) : (
          <h1 className="text-5xl">You Shall Not Pass!</h1>
        )}
      </>
    </div>
  );
}
