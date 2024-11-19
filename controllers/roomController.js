const Room = require("../models/room");
const Hotel = require("../models/hotel");


exports.createRoom = async (req, res) => {
  try {
    const { hotelId, roomType, price, description } = req.body;

    

    if (!hotelId) {
      return res.json({ success: false, message: "Hotel ID is required" });
    }

    
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    const room = new Room({
      roomType,
      price,
      image: req.file.path,
      description,
      hotel: hotelId 
    });

    const roomItem = await room.save();

    
    hotel.rooms.push(roomItem._id);
    await hotel.save(); 

    res.json({ success: true, message: "Room created", data: roomItem, hotel });
  } catch (error) {
    console.error('Error creating room:', error);
    res.json({ message: error.message });
  }
};


exports.getAllRooms = async (req, res) => {
  try {
    let rooms = await Room.find().populate('hotel', 'name');
    res.json({ success: true, data: rooms });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findByIdAndDelete(roomId);

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    await Hotel.findByIdAndUpdate(room.hotel, { $pull: { rooms: roomId } });

    res.json({ success: true, message: "Room deleted", data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.getSingleRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findById(roomId).populate('hotel', 'name');

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const updateData = {
      roomType: req.body.roomType,
      price: req.body.price,
      image: req.file ? req.file.path : undefined,
      description: req.body.description,
    };

    const room = await Room.findByIdAndUpdate(roomId, updateData, { new: true });

    if (!room) {
      return res.json({ success: false, message: "Room not found" });
    }

    res.json({ success: true, message: "Room updated", data: room });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.getRoomFeatured = async (req, res) => {
    try {
      const roomId = req.params.id;
      
      const room = await Room.findById(roomId).populate('hotel');
      
      if (!room) {
        return res.json({ message: 'Room not found' });
      }
      
      const roomFeatured = {
        id: room._id,
        roomType: room.roomType,
        price: room.price,
        image: room.image,
        hotelName: room.hotel.name,
        hotelDescription: room.hotel.description,
        hotelAmenities: room.hotel.amenities,
        hotelAddress: room.hotel.address
      };
      
      res.json(roomFeatured);
    } catch (error) {
      console.error('Error fetching room featured:', error);
      res.json({ message: 'Error fetching room featured' });
    }
  };