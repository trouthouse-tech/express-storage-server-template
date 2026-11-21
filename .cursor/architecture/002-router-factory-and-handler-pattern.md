# 002 - Router Factory and Handler Pattern

## Status

Accepted

## Goal

Standardize Express feature modules under `src/services/` so routing is predictable, handlers stay thin, and business logic remains testable.

## Scope

Applies to all API features under `src/services/{feature}/`. **Do not use `src/domains/`.**

## Core Rules

1. Use router factory functions only: `createXRouter(): Router`.
2. Routers are thin: route wiring only (no business logic, no try/catch, no DB calls).
3. Put handlers in `src/services/{feature}/routes/` with one handler per file.
4. Create `processX()` in `src/services/{feature}/process-*.ts` **only** when an operation has logic beyond plain CRUD: multi-step writes, cross-table rules, derived values, external or AI calls. It takes the client first and calls `src/data` wrappers only. Never write pass-through process functions that just forward to a data wrapper. Add a process function later, when logic actually appears.
5. Every handler follows a fixed flow:
   1) Log `📥`.  
   2) Get the managed client; if it is null, answer `500`.  
   3) Validate params, query and body; if any is bad, answer `400`.  
   4) Call the work function. For plain CRUD, that is the `src/data` wrapper (e.g. `listContextAreas(client)`). Use `processX()` only when one exists for real business logic.  
   5) Respond `200` with data, or `404` when get, update or delete finds no row.  
   One try/catch around the whole body logs `❌` and answers `500`.
6. Use managed clients only (`getManagedSupabaseClient()`, `getManagedAnthropicClient()`).
7. Always null-check managed clients before use and return `500` when unavailable.
8. Database CRUD lives in `src/data/{table}/` only; never inline queries in handlers or `processX()`.
9. Use `type` (not `interface`) for shared types.
10. Add JSDoc on router factory, handlers, and `processX()` functions.
11. Use standard emoji log prefixes: `🚀` `✅` `❌` `📥` `📤` `🤖` `💾`.

---

## Required service layout

```text
src/
  services/
    orders/
      router.ts
      types.ts
      routes/
        post-create-order-handler.ts   # calls processCreateOrder (real logic)
        get-order-by-id-handler.ts     # plain CRUD: calls selectOrderById directly
      process-create-order.ts
  data/
    orders/                    # one folder per table
      insert-order.ts
      select-order-by-id.ts
  utils/
    orders/
      normalize-order-input.ts
```

- Each feature is self-contained in `src/services/{feature}/`.
- CRUD is isolated in `src/data/{table}/`, one function per file.
- Utilities used 2+ times → `src/utils/{feature}/` as pure functions.

---

## ✅ Router factory (thin router)

```ts
import { Router } from 'express';
import { postCreateOrderHandler } from './routes/post-create-order-handler';
import { getOrderByIdHandler } from './routes/get-order-by-id-handler';

/**
 * Creates the orders router.
 */
export const createOrdersRouter = (): Router => {
  const router = Router();
  router.post('/', postCreateOrderHandler);
  router.get('/:orderId', getOrderByIdHandler);
  return router;
};
```

---

## ✅ Plain CRUD handler (calls the data wrapper)

```ts
import { Request, Response } from 'express';
import { getManagedSupabaseClient } from '../managed/clients';
import { selectOrderById } from '../../../data/orders/select-order-by-id';

/**
 * Handles GET /orders/:orderId.
 */
export const getOrderByIdHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  console.log('📥 GET /orders/:orderId');

  try {
    const supabase = getManagedSupabaseClient();
    if (!supabase) {
      console.error('❌ Supabase client is not initialized');
      return res.status(500).json({ success: false, error: 'Service unavailable' });
    }

    const orderId = req.params.orderId?.trim();
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'orderId required' });
    }

    const order = await selectOrderById(supabase, orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    console.log('📤 200 GET /orders/:orderId');
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to get order:', message);
    return res.status(500).json({ success: false, error: message });
  }
};
```

---

## ✅ Handler with business logic (calls `processX()`)

```ts
import { Request, Response } from 'express';
import { getManagedSupabaseClient } from '../managed/clients';
import { processCreateOrder } from '../process-create-order';
import { type CreateOrderRequest } from '../types';

/**
 * Handles POST /orders.
 */
export const postCreateOrderHandler = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  console.log('📥 POST /orders');

  try {
    const supabase = getManagedSupabaseClient();
    if (!supabase) {
      console.error('❌ Supabase client is not initialized');
      return res.status(500).json({ success: false, error: 'Service unavailable' });
    }

    const body = req.body as Partial<CreateOrderRequest>;
    if (!body.customerId || !Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Invalid request body' });
    }

    const result = await processCreateOrder(supabase, {
      customerId: body.customerId,
      items: body.items,
    });
    console.log('📤 200 POST /orders');
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Failed to create order:', message);
    return res.status(500).json({ success: false, error: message });
  }
};
```

---

## `processX` and data layer

- `processX()` exists only for real business logic and calls `src/data/{table}/` functions.
- `processX()` must not contain raw `.from('table')` calls.

✅ Correct (multi-step write + derived value):

```ts
import { insertOrder } from '../../data/orders/insert-order';
import { insertOrderItems } from '../../data/order-items/insert-order-items';

/**
 * Creates an order with its items and a computed total.
 */
export const processCreateOrder = async (
  supabase: SupabaseClient,
  input: { customerId: string; items: OrderItem[] },
) => {
  const total = input.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await insertOrder(supabase, { customer_id: input.customerId, total });
  await insertOrderItems(supabase, order.id, input.items);
  return order;
};
```

❌ Incorrect (pass-through; the handler should call `selectOrderById` directly):

```ts
export const processGetOrderById = async (supabase: SupabaseClient, orderId: string) =>
  selectOrderById(supabase, orderId);
```

Data functions accept `SupabaseClient` first, live under `src/data/orders/`, one per file, with `💾` logging.

---

## Definition of done

- [ ] Router exports `createXRouter(): Router` under `src/services/{feature}/`
- [ ] Handlers in `routes/`, one per file. Plain CRUD handlers call the `src/data` wrapper; handlers call `processX()` only when it holds real business logic
- [ ] No pass-through process functions
- [ ] Get, update and delete handlers answer `404` when no row is found
- [ ] CRUD only in `src/data/{table}/`, one function per file
- [ ] No `src/domains/` paths
- [ ] JSDoc on router, handlers, `processX`, and data functions
- [ ] Approved emoji logging
