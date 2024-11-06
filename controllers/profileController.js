const profileModel = require("../models/profileModel")
const userSchema = require("../models/userModel");

const getProfile = async (req, res) => {
    try {
        const user = req.user;                                       
        const userDetails = await userSchema.findById(user._id);
        let profile = await profileModel.findOne({ userId: user._id });
        
        if (!profile) {
            
            profile = new profileModel({                  
                userId: user._id,
                UserName: userDetails.UserName,
                email: userDetails.email,
                address: userDetails.address
            });
            await profile.save();
        }
        console.log("Sending profile:", profile); 
        res.json({ 
            success: true, 
            profile: {
                ...profile.toObject(),
                image: profile.image 
            }, 
            userDetails 
        });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Server error' });
    }
};


const updateProfile = async (req, res) => {
    console.log('Request file:', req.file);
    try {
        const user = req.user; 
        const { UserName, phone, address } = req.body;

        let image = req.file ? req.file.filename : null;        

        let profile = await profileModel.findOne({ userId: user._id });

        if (profile) {
            profile.UserName = UserName || profile.UserName;
            profile.phone = phone || profile.phone;
            profile.address = address || profile.address;
            profile.image = image || profile.image;
            await profile.save();
        } else {
            profile = new profileModel({
                userId: user._id,
                UserName,
                phone,
                image,
                address
            });
            await profile.save();
        }

        res.json({ success: true, profile });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Server error' });
    }
};


module.exports = { getProfile, updateProfile };