import { prisma } from "@/lib/prisma";

export async function GET() {
  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "asc" },
  });
  return Response.json(subjects);
}

export async function POST(request: Request) {
  const { name, color } = await request.json();
  if (!name || typeof name !== "string") {
    return Response.json({ error: "科目名が必要です" }, { status: 400 });
  }
  try {
    const subject = await prisma.subject.create({
      data: { name: name.trim(), color: color ?? "#3B82F6" },
    });
    return Response.json(subject, { status: 201 });
  } catch {
    return Response.json({ error: "科目名が既に存在します" }, { status: 409 });
  }
}
