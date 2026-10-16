import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'E-mail e nova senha são obrigatórios.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter pelo menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isFirstAccess: false
        }
      });
    } catch (e) {
      // Ignore if demo environment
    }

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Você já pode navegar.'
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Erro ao alterar senha.' },
      { status: 500 }
    );
  }
}
