// pages/restaurant/CreateMenuPage.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getRestaurantById } from "../../redux/actions/restaurantAction";
import {
  createMenu,
  getMenuByRestaurant,
  deleteMenu,
} from "../../redux/actions/menuAction";
import {
  getAllFoodItems,
  createFoodItem,
} from "../../redux/actions/foodActions";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  PencilIcon,
  CheckIcon,
  PhotoIcon,
  ArrowPathIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import toast from "react-hot-toast";
import axiosInstance from "../../lib/axios";

const CreateMenuPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedRestaurant: restaurant, loading: restaurantLoading } =
    useSelector((state) => state.restaurants);
  const { foodItems = [], loading: foodLoading } = useSelector(
    (state) => state.food,
  );
  const { currentMenu, loading: menuLoading } = useSelector(
    (state) => state.menu,
  );

  const [categories, setCategories] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // Food item creation state
  const [showFoodModal, setShowFoodModal] = useState(false);
  const [selectedCategoryForFood, setSelectedCategoryForFood] = useState("");
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    isPopular: false,
    isNewOne: false,
    discount: 0,
    discountStartDate: "",
    discountEndDate: "",
    servingSize: "",
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Fetch data
  useEffect(() => {
    if (id) {
      dispatch(getRestaurantById(id));
      dispatch(getAllFoodItems({ restaurantId: id, isAvailable: true }));
      dispatch(getMenuByRestaurant(id));
    }
  }, [dispatch, id]);

  // Set categories from currentMenu
  useEffect(() => {
    if (currentMenu && currentMenu.menu && Array.isArray(currentMenu.menu)) {
      setCategories(currentMenu.menu);
    } else {
      setCategories([]);
    }
  }, [currentMenu]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    // Check for duplicate category
    if (categories.some((cat) => cat.category === newCategoryName.trim())) {
      toast.error("Category already exists!");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;

      if (categories.length > 0) {
        // Menu exists - add new category to existing menu
        const updatedMenu = {
          restaurant: id,
          menu: [
            ...categories,
            { category: newCategoryName.trim(), items: [] },
          ],
        };
        result = await dispatch(createMenu(updatedMenu)).unwrap();
      } else {
        // No menu exists - create new menu with first category
        const menuData = {
          restaurant: id,
          menu: [{ category: newCategoryName.trim(), items: [] }],
        };
        result = await dispatch(createMenu(menuData)).unwrap();
      }

      toast.success("Category created successfully!");
      setNewCategoryName("");

      // Update categories from result
      if (result && result.menu && Array.isArray(result.menu)) {
        setCategories(result.menu);
      }

      // Refresh from server
      await dispatch(getMenuByRestaurant(id));
    } catch (error) {
      console.error("Add category error:", error);
      toast.error(error || "Failed to add category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategoryName = async (oldCategory, newCategory) => {
    if (!newCategory.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    if (oldCategory === newCategory.trim()) {
      setEditingCategory(null);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedMenu = {
        restaurant: id,
        menu: categories.map((cat) =>
          cat.category === oldCategory
            ? { ...cat, category: newCategory.trim() }
            : cat,
        ),
      };

      await dispatch(createMenu(updatedMenu)).unwrap();
      toast.success("Category renamed successfully!");
      setEditingCategory(null);
      setEditingName("");
      await dispatch(getMenuByRestaurant(id));
    } catch (error) {
      toast.error(error || "Failed to rename category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryName) => {
    if (
      window.confirm(
        `Delete category "${categoryName}"? All items in this category will be removed.`,
      )
    ) {
      setIsSubmitting(true);
      try {
        // Filter out the deleted category
        const updatedCategories = categories.filter(
          (cat) => cat.category !== categoryName,
        );

        console.log("=== Deleting Category ===");
        console.log(
          "Current categories:",
          categories.map((c) => c.category),
        );
        console.log("Deleting:", categoryName);
        console.log(
          "Remaining categories:",
          updatedCategories.map((c) => c.category),
        );

        // If no categories left, delete the entire menu
        if (updatedCategories.length === 0) {
          // Clear local state
          setCategories([]);

          // Delete the menu from backend if it exists
          if (currentMenu && currentMenu._id) {
            await dispatch(deleteMenu(currentMenu._id)).unwrap();
          }

          toast.success("Category deleted successfully!");

          // Refresh to ensure clean state
          await dispatch(getMenuByRestaurant(id));
          setIsSubmitting(false);
          return;
        }

        const updatedMenu = {
          restaurant: id,
          menu: updatedCategories,
        };

        console.log("Sending updated menu to backend:", updatedMenu);

        // Send the updated menu to the backend
        const result = await dispatch(createMenu(updatedMenu)).unwrap();
        console.log("Backend response:", result);

        // Update local state immediately
        setCategories(updatedCategories);

        toast.success(`Category "${categoryName}" deleted successfully!`);

        // Refresh from server to ensure sync
        await dispatch(getMenuByRestaurant(id));
      } catch (error) {
        console.error("Delete category error:", error);
        toast.error(error || "Failed to delete category");
        // Refresh to restore correct state on error
        await dispatch(getMenuByRestaurant(id));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleAddItemToCategory = async (categoryName, foodItemId) => {
    if (!foodItemId) return;

    setIsSubmitting(true);
    try {
      const updatedMenu = {
        restaurant: id,
        menu: categories.map((cat) =>
          cat.category === categoryName
            ? { ...cat, items: [...cat.items, foodItemId] }
            : cat,
        ),
      };

      await dispatch(createMenu(updatedMenu)).unwrap();
      toast.success("Item added to category!");
      await dispatch(getMenuByRestaurant(id));
    } catch (error) {
      toast.error(error || "Failed to add item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveItemFromCategory = async (
    categoryName,
    foodItemId,
    itemName,
  ) => {
    if (window.confirm(`Remove "${itemName}" from this category?`)) {
      setIsSubmitting(true);
      try {
        const updatedMenu = {
          restaurant: id,
          menu: categories.map((cat) =>
            cat.category === categoryName
              ? { ...cat, items: cat.items.filter((id) => id !== foodItemId) }
              : cat,
          ),
        };

        await dispatch(createMenu(updatedMenu)).unwrap();
        toast.success("Item removed from category!");
        await dispatch(getMenuByRestaurant(id));
      } catch (error) {
        toast.error(error || "Failed to remove item");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleOpenFoodModal = (categoryName) => {
    setSelectedCategoryForFood(categoryName);
    setShowFoodModal(true);
    resetFoodForm();
  };

  const resetFoodForm = () => {
    setNewFoodItem({
      name: "",
      description: "",
      price: "",
      isAvailable: true,
      isPopular: false,
      isNewOne: false,
      discount: 0,
      discountStartDate: "",
      discountEndDate: "",
      servingSize: "",
    });
    setImagePreviews([]);
    setImageFiles([]);
  };

  const handleFoodInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewFoodItem((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFoodImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFoodImage = (index) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const generateAIDescription = async () => {
    if (!newFoodItem.name.trim()) {
      toast.error("Please enter dish name first");
      return;
    }

    setIsGeneratingAI(true);
    const loadingToast = toast.loading(
      "AI is crafting a delicious description...",
    );

    try {
      const { data } = await axiosInstance.post(
        "/v1/food/generate-description",
        {
          name: newFoodItem.name,
          category: selectedCategoryForFood || "Main Course",
          spiceLevel: "Medium",
          price: newFoodItem.price,
        },
      );

      if (data.success && data.data) {
        setNewFoodItem((prev) => ({
          ...prev,
          description: data.data.description,
        }));
        toast.dismiss(loadingToast);
        toast.success("AI description generated!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("AI generation failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to generate description",
      );
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateFoodItem = async () => {
    if (!newFoodItem.name.trim()) {
      toast.error("Please enter food item name");
      return;
    }
    if (!newFoodItem.price || parseFloat(newFoodItem.price) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("restaurant", id);
      formData.append("name", newFoodItem.name);
      formData.append("description", newFoodItem.description);
      formData.append("price", newFoodItem.price);
      formData.append("isAvailable", newFoodItem.isAvailable);
      formData.append("isPopular", newFoodItem.isPopular);
      formData.append("isNewOne", newFoodItem.isNewOne);
      formData.append("discount", newFoodItem.discount);
      formData.append("servingSize", newFoodItem.servingSize);

      if (newFoodItem.discountStartDate) {
        formData.append("discountStartDate", newFoodItem.discountStartDate);
      }
      if (newFoodItem.discountEndDate) {
        formData.append("discountEndDate", newFoodItem.discountEndDate);
      }

      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      const result = await dispatch(createFoodItem(formData)).unwrap();

      await dispatch(getAllFoodItems({ restaurantId: id, isAvailable: true }));

      if (categories.length > 0 && selectedCategoryForFood) {
        const updatedMenu = {
          restaurant: id,
          menu: categories.map((cat) =>
            cat.category === selectedCategoryForFood
              ? { ...cat, items: [...cat.items, result._id] }
              : cat,
          ),
        };
        await dispatch(createMenu(updatedMenu)).unwrap();
        await dispatch(getMenuByRestaurant(id));
      }

      toast.success("Food item created and added to category!");
      setShowFoodModal(false);
      resetFoodForm();
    } catch (error) {
      console.error("Create food error:", error);
      toast.error(error || "Failed to create food item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    dispatch(getMenuByRestaurant(id));
    toast.success("Menu refreshed");
  };

  const getItemsInCategory = (categoryName) => {
    const category = categories.find((c) => c.category === categoryName);
    if (!category || !category.items) return [];
    return category.items;
  };

  const getFoodItemDetails = (itemId) => {
    return foodItems.find((item) => item._id === itemId);
  };

  if (restaurantLoading || foodLoading || menuLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Restaurant not found</p>
          <Link
            to="/restaurants"
            className="mt-4 text-orange-600 hover:text-orange-700"
          >
            Back to Restaurants
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-6 flex justify-between items-center">
          <Link
            to={`/restaurant/${id}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Restaurant
          </Link>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Refresh Menu
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-5">
            <h1 className="text-2xl font-bold text-white">
              {categories.length > 0 ? "Manage Menu" : "Create Menu"}
            </h1>
            <p className="text-orange-100 mt-1">
              {restaurant.name} - Organize your food items into categories
            </p>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Available Food Items
              </h2>
              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {foodItems.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No food items available</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Create food items using the "Create New Food" button in
                      each category
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {foodItems.map((item) => (
                      <div
                        key={item._id}
                        className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2">
                          {item.images && item.images[0] ? (
                            <img
                              src={item.images[0].url}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <span className="text-gray-400 text-xs">
                                No img
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              ${item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-3">
                Add New Category
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Appetizers, Main Course, Desserts"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Category
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500">No categories yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add your first category using the form above
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {categories.map((category, catIndex) => {
                  const categoryItems = getItemsInCategory(category.category);
                  const availableItems = foodItems.filter(
                    (item) => !categoryItems.includes(item._id),
                  );

                  return (
                    <div
                      key={catIndex}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                    >
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        {editingCategory === category.category ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="flex-1 px-3 py-1 border border-gray-300 rounded-lg"
                              autoFocus
                              onKeyPress={(e) =>
                                e.key === "Enter" &&
                                handleUpdateCategoryName(
                                  category.category,
                                  editingName,
                                )
                              }
                            />
                            <button
                              onClick={() =>
                                handleUpdateCategoryName(
                                  category.category,
                                  editingName,
                                )
                              }
                              className="p-1 text-green-600 hover:text-green-700"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingCategory(null);
                                setEditingName("");
                              }}
                              className="p-1 text-red-600 hover:text-red-700"
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {category.category}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {categoryItems.length} items
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCategory(category.category);
                                  setEditingName(category.category);
                                }}
                                className="p-1 text-gray-500 hover:text-orange-600 transition-colors"
                                title="Edit Category"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.category)
                                }
                                className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                title="Delete Category"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddItemToCategory(
                                  category.category,
                                  e.target.value,
                                );
                                e.target.value = "";
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            disabled={
                              availableItems.length === 0 || !currentMenu
                            }
                            value=""
                          >
                            <option value="">
                              + Add existing item to this category
                            </option>
                            {availableItems.map((item) => (
                              <option key={item._id} value={item._id}>
                                {item.name} - ${item.price}
                              </option>
                            ))}
                            {availableItems.length === 0 && (
                              <option disabled>All items added</option>
                            )}
                          </select>
                          <button
                            onClick={() =>
                              handleOpenFoodModal(category.category)
                            }
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Create New Food
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        {categoryItems.length > 0 ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {categoryItems.map((itemId, itemIndex) => {
                                const foodItem = getFoodItemDetails(itemId);
                                return (
                                  <div
                                    key={itemIndex}
                                    className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2">
                                      {foodItem?.images &&
                                      foodItem.images[0] ? (
                                        <img
                                          src={foodItem.images[0].url}
                                          alt={foodItem.name}
                                          className="w-8 h-8 object-cover rounded"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                                          <span className="text-gray-400 text-xs">
                                            No img
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {foodItem?.name || "Unknown Item"}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          ${foodItem?.price || "0"}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        handleRemoveItemFromCategory(
                                          category.category,
                                          itemId,
                                          foodItem?.name,
                                        )
                                      }
                                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      title="Remove from category"
                                    >
                                      <XMarkIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic text-center py-4">
                            No items added to this category yet
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
              <Link
                to={`/restaurant/${id}`}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back to Restaurant
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Create Food Item Modal */}
      {showFoodModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
              <div className="bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-gray-900">
                  Create New Food Item for "{selectedCategoryForFood}"
                </h3>
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="px-6 py-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={newFoodItem.name}
                    onChange={handleFoodInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    placeholder="e.g., Margherita Pizza"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <button
                      type="button"
                      onClick={generateAIDescription}
                      disabled={isGeneratingAI || !newFoodItem.name.trim()}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <SparklesIcon className="w-3 h-3" />
                      )}
                      <span>Generate with AI</span>
                    </button>
                  </div>
                  <textarea
                    name="description"
                    rows="2"
                    value={newFoodItem.description}
                    onChange={handleFoodInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Describe the food item..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price * ($)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={newFoodItem.price}
                      onChange={handleFoodInputChange}
                      step="0.01"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serving Size
                    </label>
                    <input
                      type="text"
                      name="servingSize"
                      value={newFoodItem.servingSize}
                      onChange={handleFoodInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="e.g., 1 plate, 250g"
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Discount (Optional)
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Discount %
                      </label>
                      <input
                        type="number"
                        name="discount"
                        value={newFoodItem.discount}
                        onChange={handleFoodInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="discountStartDate"
                        value={newFoodItem.discountStartDate}
                        onChange={handleFoodInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="discountEndDate"
                        value={newFoodItem.discountEndDate}
                        onChange={handleFoodInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {imagePreviews.map((preview, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFoodImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <label className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center h-24 cursor-pointer hover:border-orange-500 transition-colors">
                      <PhotoIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFoodImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    You can upload multiple images. First image will be the
                    primary.
                  </p>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={newFoodItem.isAvailable}
                      onChange={handleFoodInputChange}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={newFoodItem.isPopular}
                      onChange={handleFoodInputChange}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">Popular</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isNewOne"
                      checked={newFoodItem.isNewOne}
                      onChange={handleFoodInputChange}
                      className="w-4 h-4 text-orange-600 rounded"
                    />
                    <span className="text-sm text-gray-700">New Arrival</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl sticky bottom-0">
                <button
                  onClick={() => setShowFoodModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFoodItem}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : null}
                  Create & Add to Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateMenuPage;
