// imgbb.js
import axios from "axios";

const uploadImageToImgBB = async (file) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", import.meta.env.VITE_IMGBB_API_KEY); // Replace with your ImgBB API key
  try {
    const response = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData
    );
    if (response.data.success) {
      return response.data.data.url; // Return the image URL
    } else {
      throw new Error("Failed to upload image to ImgBB.");
    }
  } catch (error) {
    console.error("Error uploading image to ImgBB:", error);
    throw error;
  }
};

export default uploadImageToImgBB; // Export as default
