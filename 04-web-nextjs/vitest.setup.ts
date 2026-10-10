import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Размонтируем дерево после каждого теста (jsdom не чистится сам).
afterEach(() => cleanup());
