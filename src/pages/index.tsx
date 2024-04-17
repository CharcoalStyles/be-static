import type { InferGetStaticPropsType, GetStaticProps } from "next";
import axios from "axios";
import Link from "next/link";

type Photo = { id: number; title: string };
type Photos = Array<Photo>;

export default function Home({
  photos,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24`}>
      <h1 className="text-4xl font-bold mb-4">Photos</h1>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
              <li key={photo.id} className="p-4 bg-gray-100 rounded-lg hover:bg-stone-800 transition-colors">
          <Link href={`/photo/${photo.id}`}>
              <h2 className="text-xl font-bold text-slate-800 hover:text-slate-200  transition-colors">{photo.title}</h2>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

export const getStaticProps = (async (context) => {
  var photos = (
    await axios.get<Array<Photo>>(`https://jsonplaceholder.typicode.com/photos`)
  ).data  as Array<Photo>;

  return { props: { photos } };
}) satisfies GetStaticProps<{
  photos: Photos;
}>;
