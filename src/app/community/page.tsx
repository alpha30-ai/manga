import prisma from "@/lib/prisma";
import CommunityFeed from "@/components/community/CommunityFeed";
import { Users, Sparkles } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);

  const posts = await prisma.communityPost.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
      likes: {
        select: {
          userId: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Transform posts to include isLikedByCurrentUser and likesCount
  const transformedPosts = posts.map((p) => ({
    id: p.id,
    title: p.title,
    content: p.content,
    image: p.image,
    createdAt: p.createdAt,
    user: p.user,
    comments: p.comments,
    likesCount: p.likes.length,
    isLiked: session?.user?.id ? p.likes.some((l) => l.userId === session.user.id) : false,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12 pb-24 md:pb-16 space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-10 shadow-sm space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF334B]/10 text-[#FF334B] border border-[#FF334B]/20 text-xs font-bold">
          <Sparkles className="w-4 h-4" />
          <span>منتدى ومجتمع ألفا مانجا</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white">
          مجتمع القراء ومناقشات الفصول
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
          شارك آراءك، نظرياتك، وترشيحاتك لأفضل المانجات والمانهوات مع زملائك القراء في شبكة تفاعلية حية.
        </p>
      </div>

      <CommunityFeed initialPosts={transformedPosts as any} />
    </div>
  );
}
