const Hotel = require("../models/hotel");
const Room = require("../models/room");
const fs = require('fs');
const { validateHotel } = require('../validator');
const mongoose = require('mongoose');

exports.createHotel = async (req, res) => {
  if (!req.body || !req.files) {
    return res.json({ message: "Missing required data" });
  }

  let parsedAddress;
  try {
    parsedAddress = req.body.address ? JSON.parse(req.body.address) : {};
  } catch (error) {
    return res.json({ message: "Invalid address format" });
  }

  const imgFile = req.files.img ? req.files.img[0] : null;
  const galleryFiles = req.files.gallery || [];

  if (!imgFile) {
    return res.json({ message: "Main image is required" });
  }

  const hotelData = {
    name: req.body.name,
    img: imgFile.path,
    description: req.body.description,
    amenities: req.body.amenities ? req.body.amenities.split(',') : [],
    address: parsedAddress,
    gallery: galleryFiles.map(file => file.path)
  };

  const { error } = validateHotel(hotelData);
  if (error) {
    return res.json({ message: error.details.map(d => d.message).join(', ') });
  }

  const hotel = new Hotel(hotelData);

  try {
    const hotelItem = await hotel.save();
    res.json({ success: true, message: "Hotel created", data: hotelItem });
  } catch (error) {
    res.json({ message: error.message });
  }
};

exports.getAllHotel = async (req, res) => {
  try {
    let hotels = await Hotel.find().populate('rooms');
    res.json({ success: true, data: hotels });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.json({ message: error.message });
  }
};

exports.deleteHotel = async (req, res) => {
  try {
    const hotelId = req.body.id;
    if (!hotelId) {
      return res.json({ message: "Hotel ID is required" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.json({ success: false, message: "No such hotel found" });
    }

    fs.unlink(`uploads/${hotel.image}`, err => {
      if (err) {
        console.error(`Failed to delete ${hotel.image}:`, err);
      }
    });
    hotel.gallery.forEach(img => {
      fs.unlink(`uploads/${img}`, err => {
        if (err) {
          console.error(`Failed to delete ${img}:`, err);
        }
      });
    });

    await Room.deleteMany({ hotel: hotel._id });
    await Hotel.findByIdAndDelete(hotelId);
    res.json({ success: true, message: "Hotel deleted" });
  } catch (error) {
    res.json({ message: error.message });
  }
};


exports.updateHotelById = async (req, res) => {
  try {
    const hotelId = req.params.id;
    const updatedData = { ...req.body };

    if (req.files.img) {
      updatedData.img = req.files.img[0].path;
    }

    if (req.files.gallery) {
      updatedData.gallery = req.files.gallery.map(file => file.path);
    }

    if (updatedData.address) {
      updatedData.address = JSON.parse(updatedData.address);
    }

    if (updatedData.amenities) {
      updatedData.amenities = updatedData.amenities.split(',');
    }

    const { error } = validateHotel(updatedData);
    if (error) {
      return res.json({ message: error.details.map(d => d.message).join(', ') });
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(hotelId, updatedData, { new: true, runValidators: true });
    
    if (!updatedHotel) {
      return res.json({ success: false, message: "Hotel not found" });
    }

    res.json({ success: true, message: "Hotel updated", data: updatedHotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.json({ message: error.message });
  }
};

  exports.getHotelById = async (req, res) => {
    const { id } = req.params; 
  
    
    if (!id) {
      return res.json({ success: false, message: 'Hotel ID is required' });
    }
  
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: 'Invalid hotel ID' });
    }
  
    try {
      const hotel = await Hotel.findById(id) 
      .populate('rooms');
  
      if (!hotel) {
        return res.json({ success: false, message: 'Hotel not found' });
      }
  
      res.json({ success: true, data: hotel });
    } catch (error) {
      console.error(error);
      res.json({ success: false, message: 'Server error' });
    }
  };