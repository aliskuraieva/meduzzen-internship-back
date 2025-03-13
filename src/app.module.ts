import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { UsersModule } from './user/users.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT, 10),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: false,
      migrations: [path.join(__dirname, 'src/migrations/**/*{.ts,.js}')],
      migrationsRun: true,
      // ssl:
      //   process.env.NODE_ENV === 'production'
      //     ? { rejectUnauthorized: false }
      //     : undefined,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    UsersModule,
    AuthModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
