import { getNewsPosts } from "@/services/news-service";
import { getBarangayProfile } from "@/services/about-us-service";
import { NewsPageClient } from "@/components/news/news-page-client";

export default async function NewsPage() {
  const [posts, barangayProfile] = await Promise.all([
    getNewsPosts(),
    getBarangayProfile(),
  ]);

  const barangayName = barangayProfile?.name ?? "Barangay Dos";

  return <NewsPageClient posts={posts} barangayName={barangayName} />;
}
