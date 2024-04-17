import axios from "axios";
import type {
  InferGetStaticPropsType,
  GetStaticProps,
  GetStaticPaths,
} from "next";
import Link from "next/link";
import { useRouter } from "next/router";

type Photo = {
  id: number;
  albumId: number;
  title: string;
  url: string;
  thumbnailUrl: string;
};
type Thumbnail = {
  id: number;
  url: string;
};

type Data = {
  photo: Photo;
  thumbnails: Array<Thumbnail>;
};

type Repo = {
  name: string;
  stargazers_count: number;
};

var photoCache: Array<Photo> = [];

export const getStaticPaths = (async () => {
  if (photoCache.length === 0) {
    photoCache = (
      await axios.get<Array<Photo | undefined>>(
        `https://jsonplaceholder.typicode.com/photos`
      )
    ).data.filter((photo, i) => {
      if (photo === undefined) {
        console.group(`Photo at index ${i} is undefined`);
      }
      return photo !== undefined;
    }) as Array<Photo>;
  }

  const photoIds = photoCache.map((photo) => photo.id);

  var paths = photoIds.map((id) => ({ params: { id: id.toString() } }));
  return {
    paths,
    fallback: false,
  };
}) satisfies GetStaticPaths;

export const getStaticProps = (async ({ params }) => {
  var photo = (
    await axios.get<Photo>(
      `https://jsonplaceholder.typicode.com/photos/${params!.id}`
    )
  ).data;

  if (photo === undefined) {
    throw new Error(`Photo with id ${params!.id} is undefined`);
  }

  if (photoCache.length === 0) {
    photoCache = (
      await axios.get<Array<Photo>>(
        `https://jsonplaceholder.typicode.com/photos`
      )
    ).data;
  }

  const thumbnails = photoCache
    .filter(({ albumId }) => albumId === photo.albumId)
    .map(({ id, thumbnailUrl }) => ({ id, url: thumbnailUrl }));

  return {
    props: {
      data: {
        photo,
        thumbnails: thumbnails,
      },
    },
  };
}) satisfies GetStaticProps<{
  data: Data;
}>;

export default function Photo({
  data,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter();
  
  const { photo, thumbnails } = data;
  return (
    <>
      <Link href={`/`}>
        <span className="text-xl font-bold text-blue-500 hover:cursor-pointer hover:text-blue-300  transition-colors">
          Back to photos
        </span>
      </Link>
      <main
        className={`flex min-h-screen flex-col items-center justify-between p-24`}>
        <h1 className="text-4xl font-bold">{photo.title}</h1>

        <img src={photo.url} alt={photo.title} className="w-full" />

        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {thumbnails.map(({ id, url }) => (
            <li key={photo.id} className="p-4 bg-gray-100 rounded-lg">
              <Link href={`/photo/${id}`}>
                <img src={url} alt={photo.title} className="w-16" />
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
