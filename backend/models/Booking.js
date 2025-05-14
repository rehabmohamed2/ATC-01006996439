const { ObjectId } = require('mongodb');

class Booking {
  constructor(db) {
    this.collection = db.collection('bookings');
  }

  async create(bookingData) {
    try {
      const result = await this.collection.insertOne({
        ...bookingData,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return result;
    } catch (error) {
      throw error;
    }
  }

  async findByUserId(userId) {
    try {
      return await this.collection.find({ userId: new ObjectId(userId) }).toArray();
    } catch (error) {
      throw error;
    }
  }

  async findByEventId(eventId) {
    try {
      return await this.collection.find({ eventId: new ObjectId(eventId) }).toArray();
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.collection.findOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw error;
    }
  }

  async getStats(eventId) {
    try {
      const stats = await this.collection.aggregate([
        { $match: { eventId: new ObjectId(eventId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Booking; 