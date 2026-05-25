import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { createRestaurant } from "../../redux/actions/restaurantAction";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import {
  BuildingStorefrontIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CreateRestaurant = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.restaurants);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    cuisine: [],
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
    contact: {
      phone: "",
      email: "",
    },
    operatingHours: {
      monday: { open: "09:00", close: "22:00", isOpen: true },
      tuesday: { open: "09:00", close: "22:00", isOpen: true },
      wednesday: { open: "09:00", close: "22:00", isOpen: true },
      thursday: { open: "09:00", close: "22:00", isOpen: true },
      friday: { open: "09:00", close: "23:00", isOpen: true },
      saturday: { open: "10:00", close: "23:00", isOpen: true },
      sunday: { open: "10:00", close: "21:00", isOpen: true },
    },
    pricing: {
      averageCost: 0,
      currency: "USD",
    },
    isVeg: false,
  });

  const [cuisineInput, setCuisineInput] = useState("");
  const [errors, setErrors] = useState({});

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleCuisineAdd = () => {
    if (cuisineInput && !formData.cuisine.includes(cuisineInput)) {
      setFormData((prev) => ({
        ...prev,
        cuisine: [...prev.cuisine, cuisineInput],
      }));
      setCuisineInput("");
    }
  };

  const handleCuisineRemove = (cuisine) => {
    setFormData((prev) => ({
      ...prev,
      cuisine: prev.cuisine.filter((c) => c !== cuisine),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        return;
      }
    });

    setImages([...images, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Restaurant name is required";
    if (!formData.address.street)
      newErrors.street = "Street address is required";
    if (!formData.address.city) newErrors.city = "City is required";
    if (!formData.contact.phone) newErrors.phone = "Phone number is required";
    if (formData.cuisine.length === 0)
      newErrors.cuisine = "At least one cuisine is required";
    if (images.length === 0)
      newErrors.images = "At least one image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("cuisine", JSON.stringify(formData.cuisine));
    formDataToSend.append("address", JSON.stringify(formData.address));
    formDataToSend.append("contact", JSON.stringify(formData.contact));
    formDataToSend.append(
      "operatingHours",
      JSON.stringify(formData.operatingHours),
    );
    formDataToSend.append("pricing", JSON.stringify(formData.pricing));
    formDataToSend.append("isVeg", formData.isVeg);

    images.forEach((image) => {
      formDataToSend.append("images", image);
    });

    setUploadingImages(true);

    try {
      await dispatch(createRestaurant(formDataToSend)).unwrap();
      toast.success("Restaurant created successfully!");
      navigate("/owner/dashboard");
    } catch (error) {
      console.error("Failed to create restaurant:", error);
      toast.error(error || "Failed to create restaurant");
    } finally {
      setUploadingImages(false);
    }
  };

  if (loading || uploadingImages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center gap-2">
              <BuildingStorefrontIcon className="w-6 h-6 text-white" />
              <h1 className="text-xl font-semibold text-white">
                Create New Restaurant
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Restaurant Images *
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 10 && (
                  <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-32 cursor-pointer hover:border-orange-500 transition-colors">
                    <PhotoIcon className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-500 mt-1">
                      Add Image
                    </span>
                    <span className="text-xs text-gray-400">Max 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.images && (
                <p className="text-red-500 text-xs mt-1">{errors.images}</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Upload up to 10 images. First image will be the cover. Supported
                formats: JPG, PNG, GIF, WEBP
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cuisine Types *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cuisineInput}
                      onChange={(e) => setCuisineInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), handleCuisineAdd())
                      }
                      placeholder="e.g., Italian, Chinese"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    />
                    <button
                      type="button"
                      onClick={handleCuisineAdd}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.cuisine.map((c) => (
                      <span
                        key={c}
                        className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {c}
                        <button
                          type="button"
                          onClick={() => handleCuisineRemove(c)}
                          className="hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  {errors.cuisine && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cuisine}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div className="mt-4 flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isVeg"
                  checked={formData.isVeg}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label className="text-sm text-gray-700">
                  Pure Vegetarian Restaurant
                </label>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    name="address.street"
                    placeholder="Street Address *"
                    value={formData.address.street}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  {errors.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.street}</p>
                  )}
                </div>
                <input
                  type="text"
                  name="address.city"
                  placeholder="City *"
                  value={formData.address.city}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                )}
                <input
                  type="text"
                  name="address.state"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  name="address.zipCode"
                  placeholder="ZIP Code"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  name="address.country"
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="tel"
                  name="contact.phone"
                  placeholder="Phone Number *"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
                <input
                  type="email"
                  name="contact.email"
                  placeholder="Email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="number"
                  name="pricing.averageCost"
                  placeholder="Average Cost for Two *"
                  value={formData.pricing.averageCost}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <select
                  name="pricing.currency"
                  value={formData.pricing.currency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Operating Hours (Optional)
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                You can add operating hours later from the restaurant dashboard
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate("/owner/dashboard")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {uploadingImages
                  ? "Uploading Images..."
                  : loading
                    ? "Creating..."
                    : "Create Restaurant"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurant;
