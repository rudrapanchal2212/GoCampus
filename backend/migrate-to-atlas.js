/**
 * Migration Script: Local MongoDB → Atlas
 * 
 * Reads all collections from your local MongoDB (compass)
 * and writes them to your MongoDB Atlas cluster.
 */

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const LOCAL_URI = 'mongodb://localhost:27017/campus_event_db';
const ATLAS_URI = process.env.MONGO_URI;

const COLLECTIONS = ['users', 'venues', 'events', 'attendances', 'announcements', 'students'];

async function migrate() {
    if (!ATLAS_URI) {
        console.error('❌ MONGO_URI not found in .env file!');
        process.exit(1);
    }

    let localClient, atlasClient;

    try {
        // Connect to both databases
        console.log('🔌 Connecting to local MongoDB...');
        localClient = new MongoClient(LOCAL_URI);
        await localClient.connect();
        const localDb = localClient.db('campus_event_db');
        console.log('✅ Connected to local MongoDB');

        console.log('🔌 Connecting to MongoDB Atlas...');
        atlasClient = new MongoClient(ATLAS_URI);
        await atlasClient.connect();
        const atlasDb = atlasClient.db('campus_event_db');
        console.log('✅ Connected to MongoDB Atlas');

        console.log('\n========================================');
        console.log('   Starting Migration: Local → Atlas');
        console.log('========================================\n');

        let totalDocs = 0;

        for (const collName of COLLECTIONS) {
            // Read from local
            const docs = await localDb.collection(collName).find({}).toArray();
            console.log(`📦 ${collName}: Found ${docs.length} documents locally`);

            if (docs.length === 0) {
                console.log(`   ⏭️  Skipping (empty collection)\n`);
                continue;
            }

            // Clear Atlas collection first
            await atlasDb.collection(collName).deleteMany({});

            // Insert into Atlas
            const result = await atlasDb.collection(collName).insertMany(docs);
            console.log(`   ✅ Migrated ${result.insertedCount} documents to Atlas\n`);
            totalDocs += result.insertedCount;
        }

        console.log('========================================');
        console.log(`🎉 Migration Complete! ${totalDocs} total documents migrated.`);
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
    } finally {
        if (localClient) await localClient.close();
        if (atlasClient) await atlasClient.close();
        process.exit();
    }
}

migrate();
