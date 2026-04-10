import { AboutUsProvider } from "@/contexts/about-us-context";
import AboutUsPageClient from "@/components/about-us/about-us-page-dashboard";

export default function AboutUsPage() {
  return (
    <AboutUsProvider>
      <AboutUsPageClient />
    </AboutUsProvider>
  );
}
