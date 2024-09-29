import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [TasksModule, AuthModule,DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
