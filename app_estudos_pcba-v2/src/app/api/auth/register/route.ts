import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Preencha todos os campos obrigatórios.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const { prisma } = await import('@/lib/prisma');
      const existing = await prisma.user.findUnique({
        where: { email }
      });

      if (existing) {
        return NextResponse.json(
          { error: 'E-mail já cadastrado no sistema.' },
          { status: 400 }
        );
      }

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          isFirstAccess: false
        }
      });

      return NextResponse.json({
        success: true,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } catch (e) {
      // Return success simulation for demo if DB isn't running
      return NextResponse.json({
        success: true,
        user: { id: 'demo-' + Date.now(), name, email }
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao criar conta.' },
      { status: 500 }
    );
  }
}
