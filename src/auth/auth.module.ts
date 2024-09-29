import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { User } from './user.entity';  // Import User entity

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),  // Register User entity in TypeOrmModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
    }),
  ],
  controllers: [AuthController],  // Don't forget to register AuthController
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
