import prisma from "@/lib/prisma";
import UsersTable from "@/components/admin/UsersTable";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
    orderBy: { createdAt: "desc" },
  });

  return <UsersTable users={users as any} />;
}
