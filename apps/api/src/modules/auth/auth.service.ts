import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        guru: true,
        murid: true,
      },
    });

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const payload = {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-pklku-2026',
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-pklku-2026',
      expiresIn: '7d',
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refresh_token_hash: refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        photo: user.photo,
        guruId: user.guru ? Number(user.guru.id) : null,
        muridId: user.murid ? Number(user.murid.id) : null,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key-pklku-2026',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) },
      });

      if (!user || !user.refresh_token_hash) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      const isMatch = await bcrypt.compare(refreshToken, user.refresh_token_hash);
      if (!isMatch) {
        throw new UnauthorizedException('Refresh token tidak valid');
      }

      const newAccessToken = this.jwtService.sign(
        { sub: user.id.toString(), email: user.email, role: user.role },
        {
          secret: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-pklku-2026',
          expiresIn: '15m',
        },
      );

      return { accessToken: newAccessToken };
    } catch {
      throw new UnauthorizedException('Refresh token telah kadaluarsa');
    }
  }

  async logout(userId: number) {
    await this.prisma.user.update({
      where: { id: BigInt(userId) },
      data: { refresh_token_hash: null },
    });
    return { message: 'Berhasil logout' };
  }
}
