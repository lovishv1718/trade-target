import { TextPage, textPageMetadata } from "@/components/text-page";

export const metadata = textPageMetadata("editorial-policy");

export default function Page() {
  return <TextPage slug="editorial-policy" />;
}
