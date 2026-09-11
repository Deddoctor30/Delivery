import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DeliveryService } from './delivery.service';
import { EstimateDto } from './dto/estimate.dto';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}

  @Public() // расчёт можно показать и гостю до логина
  @Post('estimate')
  estimate(@Body() dto: EstimateDto) {
    return this.delivery.estimate(dto.lat, dto.lng);
  }
}
