import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { DeliveryService } from './delivery.service';
import { EstimateDto } from './dto/estimate.dto';
import { DeliveryEstimateDto } from './estimate-response.dto';

@ApiTags('delivery')
@Controller('delivery')
export class DeliveryController {
  constructor(private readonly delivery: DeliveryService) {}

  @Public() // расчёт можно показать и гостю до логина
  @Post('estimate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: DeliveryEstimateDto })
  estimate(@Body() dto: EstimateDto) {
    return this.delivery.estimate(dto.lat, dto.lng);
  }
}
