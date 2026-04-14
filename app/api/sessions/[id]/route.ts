import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const sessionId = parseInt(id, 10);
  if (isNaN(sessionId)) {
    return Response.json({ error: "無効なIDです" }, { status: 400 });
  }
  await prisma.studySession.delete({ where: { id: sessionId } });
  return new Response(null, { status: 204 });
}
