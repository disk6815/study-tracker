import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!userId) {
    return Response.json({ error: "userId が必要です" }, { status: 400 });
  }

  const sessions = await prisma.studySession.findMany({
    where: {
      subject: { userId: parseInt(userId, 10) },
      ...(from && { date: { gte: new Date(from) } }),
      ...(to && { date: { lte: new Date(to) } }),
    },
    include: { subject: true },
    orderBy: { date: "desc" },
  });
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const { subjectId, date, duration, note, userId } = await request.json();
  if (!subjectId || !date || !duration || !userId) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 });
  }

  // subjectがそのuserのものか確認
  const subject = await prisma.subject.findFirst({
    where: { id: parseInt(subjectId, 10), userId: parseInt(userId, 10) },
  });
  if (!subject) {
    return Response.json({ error: "科目が見つかりません" }, { status: 404 });
  }

  const session = await prisma.studySession.create({
    data: {
      subjectId: parseInt(subjectId, 10),
      date: new Date(date),
      duration: parseInt(duration, 10),
      note: note ?? null,
    },
    include: { subject: true },
  });
  return Response.json(session, { status: 201 });
}
