import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET || 'super-secret-access-key-pklku-2026',
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      include: {
        guru: true,
        murid: true,
      },
    });

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('Sesi tidak valid atau user telah dinonaktifkan');
    }

    return {
      id: Number(user.id),
      email: user.email,
      name: user.name,
      role: user.role,
      guruId: user.guru ? Number(user.guru.id) : null,
      muridId: user.murid ? Number(user.murid.id) : null,
    };
  }
}
