import { Injectable } from '@nestjs/common';

// абстракция «текущего времени» — чтобы в тестах подменять
export abstract class Clock {
  abstract now(): Date;
}

@Injectable()
export class SystemClock extends Clock {
  now(): Date {
    return new Date();
  }
}
