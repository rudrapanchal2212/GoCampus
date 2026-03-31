const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const ATLAS_URI = process.env.MONGO_URI;

async function testConnection() {
    if (!ATLAS_URI) {
        console.error('❌ MONGO_URI not found in .env file!');
        process.exit(1);
    }

    let client;

    try {
        console.log('🔌 Connecting to MongoDB Atlas...');
        client = new MongoClient(ATLAS_URI);
        await client.connect();
        const db = client.db('campus_event_db');
        console.log('✅ Connected to MongoDB Atlas');

        const colls = ['users', 'venues', 'events', 'attendances', 'announcements'];
        for (const collName of colls) {
            const count = await db.collection(collName).countDocuments();
            console.log(`📦 ${collName}: ${count} documents found`);
        }

        const eventsMissingReg = await db.collection('events').countDocuments({ registrations: { $exists: false } });
        console.log(`⚠️ Events missing 'registrations' field: ${eventsMissingReg}`);

        if (eventsMissingReg > 0) {
            console.log('🔄 Fixing events missing registrations field...');
            const result = await db.collection('events').updateMany(
                { registrations: { $exists: false } },
                { $set: { registrations: [] } }
            );
            console.log(`✅ Fixed ${result.modifiedCount} events`);
        }

        const eventsMissingSub = await db.collection('events').countDocuments({ subEvents: { $exists: false } });
        console.log(`⚠️ Events missing 'subEvents' field: ${eventsMissingSub}`);

        if (eventsMissingSub > 0) {
            console.log('🔄 Fixing events missing subEvents field...');
            const result = await db.collection('events').updateMany(
                { subEvents: { $exists: false } },
                { $set: { subEvents: [] } }
            );
            console.log(`✅ Fixed ${result.modifiedCount} events`);
        }

    } catch (error) {
        console.error('❌ Error testing Atlas:', error.message);
    } finally {
        if (client) await client.close();
        process.exit();
    }
}

testConnection();
