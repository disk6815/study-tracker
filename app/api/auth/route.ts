import { prisma } from "@/lib/prisma";

// 名前でユーザーを検索または作成
export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || typeof name !== "string" || !name.trim()) {
    return Response.json({ error: "名前を入力してください" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { name: name.trim() },
    update: {},
    create: { name: name.trim() },
  });

  return Response.json(user);
}
