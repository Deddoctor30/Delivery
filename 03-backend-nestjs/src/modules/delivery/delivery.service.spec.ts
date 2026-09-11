import { DeliveryService } from './delivery.service';

describe('DeliveryService', () => {
  let service: DeliveryService;

  beforeEach(() => {
    // без DI: чистый класс, просто инстанцируем
    service = new DeliveryService();
  });

  it('Москва (та же точка) → минимум 2 дня, базовый тариф', () => {
    const r = service.estimate(55.7558, 37.6173);
    expect(r.distanceKm).toBe(0);
    expect(r.estimatedDays).toBe(2);
    expect(r.deliveryAmount).toBe(30_000);
  });

  it('Санкт-Петербург → ~630 км, около 3 дней', () => {
    const r = service.estimate(59.9311, 30.3609);
    expect(r.distanceKm).toBeGreaterThan(600);
    expect(r.distanceKm).toBeLessThan(700);
    expect(r.estimatedDays).toBe(3);
  });

  it('Новосибирск → больше дней, чем Питер', () => {
    const spb = service.estimate(59.9311, 30.3609);
    const nsk = service.estimate(55.0084, 82.9357);
    expect(nsk.estimatedDays).toBeGreaterThan(spb.estimatedDays);
    expect(nsk.distanceKm).toBeGreaterThan(spb.distanceKm);
  });

  it('Владивосток → срок упирается в потолок 14 дней', () => {
    const r = service.estimate(43.1198, 131.8869);
    expect(r.estimatedDays).toBe(14);
    expect(r.deliveryAmount).toBeGreaterThan(30_000);
  });

  it('estimatedDays всегда в диапазоне [2, 14]', () => {
    const points = [
      [55.7558, 37.6173],
      [59.9311, 30.3609],
      [55.0084, 82.9357],
      [43.1198, 131.8869],
      [64.5401, 40.5433], // Архангельск
    ];
    for (const [lat, lng] of points) {
      const r = service.estimate(lat, lng);
      expect(r.estimatedDays).toBeGreaterThanOrEqual(2);
      expect(r.estimatedDays).toBeLessThanOrEqual(14);
    }
  });
});
