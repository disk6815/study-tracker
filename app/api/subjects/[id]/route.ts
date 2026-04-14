import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const subjectId = parseInt(id, 10);
  if (isNaN(subjectId)) {
    return Response.json({ error: "無効なIDです" }, { status: 400 });
  }
  await prisma.subject.delete({ where: { id: subjectId } });
  return new Response(null, { status: 204 });
}
