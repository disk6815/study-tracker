import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const sessionId = parseInt(id, 10);

  if (isNaN(sessionId) || !userId) {
    return Response.json({ error: "無効なパラメータです" }, { status: 400 });
  }

  const session = await prisma.studySession.findFirst({
    where: { id: sessionId, subject: { userId: parseInt(userId, 10) } },
  });
  if (!session) {
    return Response.json({ error: "見つかりません" }, { status: 404 });
  }

  await prisma.studySession.delete({ where: { id: sessionId } });
  return new Response(null, { status: 204 });
}
