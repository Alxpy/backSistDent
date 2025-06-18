import Role from "../models/role/Role";

const roltes = [
  {
    _id: "685239e5966aac84a216990a",
    name: 'admin',
    description: 'Administrator with full access to the system',
  },
  {
    _id: "685239e6966aac84a2169914",
    name: 'dentist',
    description: 'Dentist with access to patient records and treatment plans',
  },
  {
    _id: "685239e6966aac84a2169916",
    name: 'assistant',
    description: 'Dental assistant with limited access to patient records',
  },
  {
    _id: "685239e6966aac84a2169918",
    name: 'patient',
    description: 'Patient with access to their own records and appointments',
  },
]

export const generateRoles = async ( ) => {
  try {
    
    const count = await Role.countDocuments();

    if (count > 0) {
      console.log("Roles already exist in the database.");
      return;
    }

    for (const roleData of roltes) {
      const role = new Role(roleData);
      await role.save();
      console.log(`Role ${role.name} created successfully.`);
    }

  } catch (error) {
    console.log(`Error generating roles: ${error}`);
  }
}