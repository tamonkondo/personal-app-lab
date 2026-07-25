import { config } from "./libs/config";
import { app } from "./app";

app.listen(config.PORT, () => {
  console.log(`API server running on port ${config.PORT}`);
});
