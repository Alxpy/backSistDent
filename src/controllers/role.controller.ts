import Role from "../models/role/Role";

const roltes = [
  {
    name: 'admin',
    description: 'Administrator with full access to the system',
  },
  {
    name: 'dentist',
    description: 'Dentist with access to patient records and treatment plans',
  },
  {
    name: 'assistant',
    description: 'Dental assistant with limited access to patient records',
  },
  {
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