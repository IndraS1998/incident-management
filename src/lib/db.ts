import mongoose from 'mongoose';
import { Admin, Department, Building, Floor, Room, Incident, IncidentResolution, AdminDepartment } from './models';

export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error('Please add your Mongo URI to .env.local');
  }

  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(uri);
    }

    // Initialize all models and indexes
    await Promise.all([
      //Admin.init(),
      //Department.init(),
      //Building.init(),
      //Floor.init(),
      //Room.init(),
      Incident.init(),
      //IncidentResolution.init(),
      //AdminDepartment.init()
    ]);

    // Create any additional indexes not defined in schemas
    await createAdditionalIndexes();

    return {
      success: true,
      message: 'Database initialized successfully with all collections and indexes'
    };
  } catch (error) {
    console.error('Database initialization failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error during database initialization'
    };
  }
}

async function createAdditionalIndexes(): Promise<void> {
  // Add any compound indexes or additional indexes here
  await Admin.collection.createIndex({ email: 1 }, { unique: true });
  await Room.collection.createIndex(
    { room_number: 1, floor_number: 1, building_name: 1 }, 
    { unique: true }
  );
  // Add other indexes as needed...
}