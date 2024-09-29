import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigModule here

@Module({
  imports: [
    ConfigModule, // Include ConfigModule in imports
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Use ConfigModule instead of ConfigService
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true, // Set false in production
      }),
    }),
  ],
})
export class DatabaseModule {}
