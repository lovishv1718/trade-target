import { TextPage, textPageMetadata } from "@/components/text-page";

export const metadata = textPageMetadata("terms-and-conditions");

export default function Page() {
  return <TextPage slug="terms-and-conditions" />;
}
