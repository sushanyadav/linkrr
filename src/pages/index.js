import { getSession } from "next-auth/client";
export default function HomePage() {
  return (
    <main className="container center-vph-w-header">
      <h1>Lets create a link</h1>
    </main>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req });

  if (!session) {
    return {
      redirect: { destination: "/auth", permanent: false },
    };
  }

  return {
    props: { session },
  };
}
