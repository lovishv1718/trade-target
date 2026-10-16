import { TextPage, textPageMetadata } from "@/components/text-page";

export const metadata = textPageMetadata("disclaimer");

export default function Page() {
  return <TextPage slug="disclaimer" />;
}
