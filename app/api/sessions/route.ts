import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const sessions = await prisma.studySession.findMany({
    where: {
      ...(from && { date: { gte: new Date(from) } }),
      ...(to && { date: { lte: new Date(to) } }),
    },
    include: { subject: true },
    orderBy: { date: "desc" },
  });
  return Response.json(sessions);
}

export async function POST(request: Request) {
  const { subjectId, date, duration, note } = await request.json();
  if (!subjectId || !date || !duration) {
    return Response.json({ error: "必須項目が不足しています" }, { status: 400 });
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
