import { Suspense } from "react";
import { notFound } from "next/navigation";
import { navigation } from "@/lib/navigation";
import { SectionPage } from "@/components/section-page";
import { BrainsPage } from "@/components/brains/brains-page";
import { DocumentsPage } from "@/components/documents/documents-page";
import Loading from "@/app/loading";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  return {
    title:
      navigation.find((item) => item.href === `/${section}`)?.label ??
      "Not found",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!navigation.some((item) => item.href === `/${section}`)) notFound();
  return (
    <Suspense fallback={<Loading />}>
      {section === "my-brain" ? (
        <BrainsPage />
      ) : section === "documents" ? (
        <DocumentsPage />
      ) : (
        <SectionPage section={section} />
      )}
    </Suspense>
  );
}
