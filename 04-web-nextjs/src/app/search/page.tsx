import { SearchPage } from "@/views/search";

/**
 * Тонкий роут /search. Next 16: searchParams — Promise.
 */
export default async function SearchRoute(props: PageProps<"/search">) {
  const sp = await props.searchParams;
  const query = typeof sp.q === "string" ? sp.q : "";

  return <SearchPage query={query} />;
}
