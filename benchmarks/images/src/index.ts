import { run, bench, boxplot, summary } from "mitata";

import { run as rust } from "./rust";
import { run as node } from "./node";

boxplot(() => {
  summary(() => {
    bench("rust sqrt", () => rust("sqrt"));
    bench("node sqrt", () => node("sqrt"));
    bench("rust dominant", () => rust("dominant"));
    bench("node dominant", () => node("dominant"));
  });
});

await run();
