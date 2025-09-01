import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
    });
  }

  async validate(payload: any) {
    // ✅ Adjust here depending on your JWT payload structure
    const userId = payload.sub; // usually "sub" contains the user id
    const userEmail = payload.email; // sometimes you also have email in the payload

    let user = null;
    if (userId) {
      user = await this.usersService.findById(userId);
    } else if (userEmail) {
      user = await this.usersService.findByEmail(userEmail);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // ✅ Return only safe user data (not password, etc.)
    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}
