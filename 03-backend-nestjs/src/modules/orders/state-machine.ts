import { OrderStatus } from '@prisma/client';

// матрица разрешённых переходов (из order-state-machine.md)
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  created: ['processing', 'cancelled'],
  processing: ['courier_picked_up', 'cancelled'],
  courier_picked_up: ['in_delivery'],
  in_delivery: ['arrived'],
  arrived: ['completed'],
  completed: [],
  cancelled: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}
