import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }])], // для suggest
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
