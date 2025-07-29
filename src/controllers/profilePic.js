const cloudinary = require('cloudinary').v2;
const User = require("../models/user");


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const generateProfilePicSignature = (req, res) => {
  try {
    const userId = req.result._id; // Using your auth structure
    const timestamp = Math.round(new Date().getTime() / 1000);

    const transformation = 'w_250,h_250,c_fill,g_face,r_max';

    const uploadParams = {
      timestamp: timestamp,
      folder: 'profile_pictures' ,
      transformation: transformation
    };

    // Generate the signature
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET 
    );

    // Send back everything the frontend needs
    res.json({
      signature,
      timestamp,
      transformation ,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      folder: 'profile_pictures',
      upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`
    });

  } catch (error){
    console.error('Error generating profile picture upload signature:', error);
    res.status(500).json({ error: 'Failed to generate upload credentials' });
  }

};


const updateProfilePicInfo = async (req, res) => {
    const userId = req.result.id; // From your auth middleware
    const { public_id, url } = req.body;
    if (!public_id || !url) {
        return res.status(400).json({ message: 'Missing public_id or url in request.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // IMPORTANT: Delete the old image to avoid orphaned files in Cloudinary
        if (user.profilePicPublicId) {
            await cloudinary.uploader.destroy(user.profilePicPublicId);
        }

        // Update the user document with the new image info
        user.profilePicUrl = url;
        user.profilePicPublicId = public_id;
        await user.save();

        // Return the updated user object (excluding sensitive fields)
        const userObject = user.toObject();
        delete userObject.password;

        res.status(200).json({
            message: 'Profile picture updated successfully.',
            user: userObject
        });

    } catch (error) {
        console.error('Error updating profile picture info:', error);
        res.status(500).json({ message: 'Server error while updating profile.' });
    }
};


module.exports = {generateProfilePicSignature , updateProfilePicInfo} ;