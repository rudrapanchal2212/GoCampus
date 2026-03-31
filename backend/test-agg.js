const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const ATLAS_URI = process.env.MONGO_URI;

async function testAggregation() {
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

        console.log('📊 Running popularEvents aggregation test...');
        const popularEvents = await db.collection('events').aggregate([
            { $match: { isActive: true } },
            {
                $project: {
                    title: 1,
                    registrationCount: { $size: { $ifNull: ["$registrations", []] } }
                }
            },
            { $sort: { registrationCount: -1 } },
            { $limit: 5 }
        ]).toArray();
        console.log('✅ aggregation successful:', popularEvents.length, 'events found');

        console.log('📊 Running departmentParticipation aggregation test...');
        const departmentParticipation = await db.collection('attendances').aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'student',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $group: {
                    _id: '$studentInfo.department',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();
        console.log('✅ aggregation successful:', departmentParticipation.length, 'departments participation found');

    } catch (error) {
        console.error('❌ Aggregation test failed:', error.message);
    } finally {
        if (client) await client.close();
        process.exit();
    }
}

testAggregation();
