import { TextPage, textPageMetadata } from "@/components/text-page";

export const metadata = textPageMetadata("privacy-policy");

export default function Page() {
  return <TextPage slug="privacy-policy" />;
}
