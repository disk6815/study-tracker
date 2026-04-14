import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return Response.json({ error: "userId が必要です" }, { status: 400 });
  }

  const subjects = await prisma.subject.findMany({
    where: { userId: parseInt(userId, 10) },
    orderBy: { createdAt: "asc" },
  });
  return Response.json(subjects);
}

export async function POST(request: Request) {
  const { name, color, userId } = await request.json();
  if (!name || typeof name !== "string" || !userId) {
    return Response.json({ error: "name と userId が必要です" }, { status: 400 });
  }
  try {
    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        color: color ?? "#3B82F6",
        userId: parseInt(userId, 10),
      },
    });
    return Response.json(subject, { status: 201 });
  } catch {
    return Response.json({ error: "科目名が既に存在します" }, { status: 409 });
  }
}
