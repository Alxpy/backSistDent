import app from "./app";
import { PORT } from "./config";
import { generateAdminUser } from "./controllers/auth.controller";
import { generatePatients } from "./controllers/patient.controller";
import { generateRoles } from "./controllers/role.controller";
import { generateTreatments } from "./controllers/treatment.controller";
import { connectDB } from "./db/connect";

connectDB().then(() => {
  generateRoles().then(() => {
    generateAdminUser();
  });
  generatePatients()
  generateTreatments();
  app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
  });
});
