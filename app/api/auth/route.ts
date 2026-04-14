import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { name, password } = await request.json();

  if (!name?.trim() || !password?.trim()) {
    return Response.json({ error: "名前とパスワードを入力してください" }, { status: 400 });
  }

  const trimmedName = name.trim();
  const existingUser = await prisma.user.findUnique({ where: { name: trimmedName } });

  if (existingUser) {
    // ログイン：パスワードを確認
    const isValid = await bcrypt.compare(password, existingUser.password);
    if (!isValid) {
      return Response.json({ error: "パスワードが違います" }, { status: 401 });
    }
    return Response.json({ id: existingUser.id, name: existingUser.name });
  } else {
    // 新規登録：パスワードをハッシュ化して保存
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: trimmedName, password: hashedPassword },
    });
    return Response.json({ id: user.id, name: user.name }, { status: 201 });
  }
}
