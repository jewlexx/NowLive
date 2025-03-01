import { run, bench, boxplot, summary } from "mitata";

import { run as rust } from "./rust";
import { run as node } from "./node";

boxplot(() => {
  summary(() => {
    bench("rust", rust);
    bench("node", node);
  });
});

await run();
