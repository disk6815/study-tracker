import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const subjectId = parseInt(id, 10);

  if (isNaN(subjectId) || !userId) {
    return Response.json({ error: "無効なパラメータです" }, { status: 400 });
  }

  const subject = await prisma.subject.findFirst({
    where: { id: subjectId, userId: parseInt(userId, 10) },
  });
  if (!subject) {
    return Response.json({ error: "見つかりません" }, { status: 404 });
  }

  await prisma.subject.delete({ where: { id: subjectId } });
  return new Response(null, { status: 204 });
}
