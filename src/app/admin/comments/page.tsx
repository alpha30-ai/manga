import prisma from "@/lib/prisma";
import CommentsTable from "@/components/admin/CommentsTable";

export default async function CommentsPage() {
  const comments = await prisma.comment.findMany({
    include: {
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return <CommentsTable comments={comments as any} />;
}
